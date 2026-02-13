import { logger } from "./logger";
import { type Transaction, withTransaction } from "./transaction";

const log = logger.child({ module: "bulk" });

/**
 * Result of a bulk operation.
 */
export interface BulkResult<T> {
  /** Total items processed. */
  total: number;
  /** Number of items that succeeded. */
  succeeded: number;
  /** Number of items that failed. */
  failed: number;
  /** Details about individual failures. */
  errors: Array<{ index: number; error: string; item?: unknown }>;
  /** Successfully processed items. */
  data: T[];
}

/**
 * Options for bulk operations.
 */
export interface BulkOptions {
  /**
   * Transaction strategy:
   * - `"all_or_nothing"` — All items processed in a single transaction; any failure rolls back everything.
   * - `"best_effort"` — Each item processed independently; failures are collected, successes are kept.
   *
   * Default: `"best_effort"`
   */
  transaction?: "all_or_nothing" | "best_effort";
  /** Number of items to process per batch (default: 100). */
  batchSize?: number;
}

/**
 * Process items in chunks of a given size.
 */
function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/**
 * Bulk create items using a provided create function.
 *
 * @param items - Items to create.
 * @param createFn - Function that creates a single item. Receives the item and optional transaction.
 * @param options - Bulk operation options.
 *
 * @example
 * ```ts
 * const result = await bulkCreate(
 *   [{ name: "Alice" }, { name: "Bob" }],
 *   (item, tx) => usersRepo.create(item, tx),
 *   { transaction: "best_effort" },
 * );
 * console.log(`${result.succeeded}/${result.total} created`);
 * ```
 */
export async function bulkCreate<TInsert, TResult>(
  items: TInsert[],
  createFn: (item: TInsert, tx?: Transaction) => Promise<TResult>,
  options?: BulkOptions,
): Promise<BulkResult<TResult>> {
  const strategy = options?.transaction ?? "best_effort";
  const batchSize = options?.batchSize ?? 100;

  log.info(
    { operation: "bulkCreate", total: items.length, strategy, batchSize },
    "Starting bulk create",
  );

  if (strategy === "all_or_nothing") {
    return executeAllOrNothing(items, (item, tx) => createFn(item, tx));
  }

  return executeBestEffort(items, batchSize, (item) => createFn(item));
}

/**
 * Bulk update items using a provided update function.
 *
 * @param items - Items to update, each with an `id` and `data` payload.
 * @param updateFn - Function that updates a single item. Returns the updated item or undefined if not found.
 * @param options - Bulk operation options.
 *
 * @example
 * ```ts
 * const result = await bulkUpdate(
 *   [{ id: "1", data: { name: "Alice" } }, { id: "2", data: { name: "Bob" } }],
 *   (id, data, tx) => usersRepo.update(id, data, tx),
 * );
 * ```
 */
export async function bulkUpdate<TUpdate, TResult>(
  items: Array<{ id: string; data: TUpdate }>,
  updateFn: (
    id: string,
    data: TUpdate,
    tx?: Transaction,
  ) => Promise<TResult | undefined>,
  options?: BulkOptions,
): Promise<BulkResult<TResult>> {
  const strategy = options?.transaction ?? "best_effort";
  const batchSize = options?.batchSize ?? 100;

  log.info(
    { operation: "bulkUpdate", total: items.length, strategy, batchSize },
    "Starting bulk update",
  );

  if (strategy === "all_or_nothing") {
    return executeAllOrNothing(items, async (item, tx) => {
      const result = await updateFn(item.id, item.data, tx);
      if (!result) throw new Error(`Item with id '${item.id}' not found`);
      return result;
    });
  }

  return executeBestEffort(items, batchSize, async (item) => {
    const result = await updateFn(item.id, item.data);
    if (!result) throw new Error(`Item with id '${item.id}' not found`);
    return result;
  });
}

/**
 * Bulk delete items using a provided delete function.
 *
 * @param ids - IDs of items to delete.
 * @param deleteFn - Function that deletes a single item. Returns true if deleted.
 * @param options - Bulk operation options.
 *
 * @example
 * ```ts
 * const result = await bulkDelete(
 *   ["id1", "id2", "id3"],
 *   (id, tx) => usersRepo.delete(id, tx),
 * );
 * ```
 */
export async function bulkDelete(
  ids: string[],
  deleteFn: (id: string, tx?: Transaction) => Promise<boolean>,
  options?: BulkOptions,
): Promise<BulkResult<{ id: string }>> {
  const strategy = options?.transaction ?? "best_effort";
  const batchSize = options?.batchSize ?? 100;

  log.info(
    { operation: "bulkDelete", total: ids.length, strategy, batchSize },
    "Starting bulk delete",
  );

  if (strategy === "all_or_nothing") {
    return executeAllOrNothing(ids, async (id, tx) => {
      const deleted = await deleteFn(id, tx);
      if (!deleted) throw new Error(`Item with id '${id}' not found`);
      return { id };
    });
  }

  return executeBestEffort(ids, batchSize, async (id) => {
    const deleted = await deleteFn(id);
    if (!deleted) throw new Error(`Item with id '${id}' not found`);
    return { id };
  });
}

/**
 * Execute all items in a single transaction — any failure rolls back everything.
 */
async function executeAllOrNothing<TItem, TResult>(
  items: TItem[],
  processFn: (item: TItem, tx: Transaction) => Promise<TResult>,
): Promise<BulkResult<TResult>> {
  try {
    const data = await withTransaction(async (tx) => {
      const results: TResult[] = [];
      for (let i = 0; i < items.length; i++) {
        results.push(await processFn(items[i]!, tx));
      }
      return results;
    });

    log.info(
      {
        operation: "all_or_nothing",
        total: items.length,
        succeeded: data.length,
      },
      "Bulk operation completed",
    );

    return {
      total: items.length,
      succeeded: data.length,
      failed: 0,
      errors: [],
      data,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    log.error(
      { operation: "all_or_nothing", total: items.length, error },
      "Bulk operation rolled back",
    );

    return {
      total: items.length,
      succeeded: 0,
      failed: items.length,
      errors: items.map((_, index) => ({
        index,
        error: `Transaction rolled back: ${message}`,
      })),
      data: [],
    };
  }
}

/**
 * Execute items in batches — failures are collected, successes are kept.
 */
async function executeBestEffort<TItem, TResult>(
  items: TItem[],
  batchSize: number,
  processFn: (item: TItem) => Promise<TResult>,
): Promise<BulkResult<TResult>> {
  const data: TResult[] = [];
  const errors: BulkResult<TResult>["errors"] = [];
  let globalIndex = 0;

  const batches = chunk(items, batchSize);

  for (const batch of batches) {
    // Process items within a batch concurrently
    const results = await Promise.allSettled(
      batch.map((item) => processFn(item)),
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        data.push(result.value);
      } else {
        const message =
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason);
        errors.push({
          index: globalIndex,
          error: message,
          item: items[globalIndex],
        });
      }
      globalIndex++;
    }
  }

  log.info(
    {
      operation: "best_effort",
      total: items.length,
      succeeded: data.length,
      failed: errors.length,
    },
    "Bulk operation completed",
  );

  return {
    total: items.length,
    succeeded: data.length,
    failed: errors.length,
    errors,
    data,
  };
}
