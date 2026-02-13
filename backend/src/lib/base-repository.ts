import {
  and,
  count,
  eq,
  type InferInsertModel,
  type InferSelectModel,
  isNull,
  type SQL,
} from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

import { resolveExecutor, type Transaction } from "./transaction";

/**
 * Options for the `findMany` method.
 */
export interface FindManyOptions {
  offset: number;
  limit: number;
  where?: SQL;
  orderBy?: SQL;
}

/**
 * Configuration for BaseRepository.
 */
export interface BaseRepositoryConfig {
  /** Enable soft delete behavior (requires `deletedAt` column). */
  softDelete?: boolean;
}

// Drizzle's table types are complex — we use a permissive alias to keep generics manageable.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPgTable = PgTable<any>;

/**
 * Abstract base repository that encapsulates common CRUD operations for Drizzle tables.
 *
 * @typeParam TTable - Drizzle table type (e.g. `typeof users`)
 *
 * @example
 * ```ts
 * class UsersRepository extends BaseRepository<typeof users> {
 *   constructor() {
 *     super(users, { softDelete: true });
 *   }
 * }
 * ```
 */
export abstract class BaseRepository<TTable extends AnyPgTable> {
  constructor(
    protected readonly table: TTable,
    protected readonly config: BaseRepositoryConfig = {},
  ) {}

  /**
   * Build the base WHERE condition, automatically excluding soft-deleted records.
   */
  protected baseWhere(includeSoftDeleted = false): SQL | undefined {
    if (
      this.config.softDelete &&
      !includeSoftDeleted &&
      "deletedAt" in this.table
    ) {
      return isNull(
        (this.table as Record<string, unknown>).deletedAt as SQL<unknown>,
      );
    }
    return undefined;
  }

  /**
   * Combine the base WHERE (soft delete filter) with additional conditions.
   */
  protected mergeWhere(
    where?: SQL,
    includeSoftDeleted = false,
  ): SQL | undefined {
    const base = this.baseWhere(includeSoftDeleted);
    if (base && where) return and(base, where);
    return base ?? where;
  }

  // Helper to get a column from the table by name
  private col(name: string): SQL<unknown> {
    return (this.table as Record<string, unknown>)[name] as SQL<unknown>;
  }

  /**
   * Find a single record by its primary key `id`.
   */
  async findById(
    id: string,
    tx?: Transaction,
  ): Promise<InferSelectModel<TTable> | undefined> {
    const executor = resolveExecutor(tx);

    const rows = await executor
      .select()
      .from(this.table as AnyPgTable)
      .where(this.mergeWhere(eq(this.col("id"), id)))
      .limit(1);

    return rows[0] as InferSelectModel<TTable> | undefined;
  }

  /**
   * Find a single record matching the given condition.
   */
  async findOne(
    where: SQL,
    tx?: Transaction,
  ): Promise<InferSelectModel<TTable> | undefined> {
    const executor = resolveExecutor(tx);

    const rows = await executor
      .select()
      .from(this.table as AnyPgTable)
      .where(this.mergeWhere(where))
      .limit(1);

    return rows[0] as InferSelectModel<TTable> | undefined;
  }

  /**
   * Find multiple records with pagination and optional filtering/ordering.
   */
  async findMany(
    options: FindManyOptions,
    tx?: Transaction,
  ): Promise<{ data: InferSelectModel<TTable>[]; total: number }> {
    const executor = resolveExecutor(tx);
    const where = this.mergeWhere(options.where);

    const defaultOrderBy =
      "createdAt" in this.table ? this.col("createdAt") : undefined;
    const orderBy = options.orderBy ?? defaultOrderBy;

    const dataQuery = executor
      .select()
      .from(this.table as AnyPgTable)
      .where(where)
      .limit(options.limit)
      .offset(options.offset)
      .$dynamic();

    if (orderBy) {
      dataQuery.orderBy(orderBy);
    }

    const countQuery = executor
      .select({ count: count() })
      .from(this.table as AnyPgTable)
      .where(where);

    const [data, countResult] = await Promise.all([dataQuery, countQuery]);

    return {
      data: data as InferSelectModel<TTable>[],
      total: countResult[0]?.count ?? 0,
    };
  }

  /**
   * Count records matching the given condition.
   */
  async count(where?: SQL, tx?: Transaction): Promise<number> {
    const executor = resolveExecutor(tx);
    const mergedWhere = this.mergeWhere(where);

    const result = await executor
      .select({ count: count() })
      .from(this.table as AnyPgTable)
      .where(mergedWhere);

    return result[0]?.count ?? 0;
  }

  /**
   * Check if at least one record matches the given condition.
   */
  async exists(where: SQL, tx?: Transaction): Promise<boolean> {
    const total = await this.count(where, tx);
    return total > 0;
  }

  /**
   * Insert a new record.
   */
  async create(
    data: InferInsertModel<TTable>,
    tx?: Transaction,
  ): Promise<InferSelectModel<TTable>> {
    const executor = resolveExecutor(tx);

    const rows = await executor
      .insert(this.table as AnyPgTable)
      .values(data as Record<string, unknown>)
      .returning();

    return rows[0] as InferSelectModel<TTable>;
  }

  /**
   * Update a record by its primary key `id`.
   */
  async update(
    id: string,
    data: Partial<InferSelectModel<TTable>>,
    tx?: Transaction,
  ): Promise<InferSelectModel<TTable> | undefined> {
    const executor = resolveExecutor(tx);

    const rows = await executor
      .update(this.table as AnyPgTable)
      .set(data as Record<string, unknown>)
      .where(this.mergeWhere(eq(this.col("id"), id)))
      .returning();

    return rows[0] as InferSelectModel<TTable> | undefined;
  }

  /**
   * Hard-delete a record by its primary key `id`.
   */
  async hardDelete(id: string, tx?: Transaction): Promise<boolean> {
    const executor = resolveExecutor(tx);

    const result = await executor
      .delete(this.table as AnyPgTable)
      .where(eq(this.col("id"), id))
      .returning();

    return result.length > 0;
  }

  /**
   * Delete a record — soft-delete if enabled, otherwise hard-delete.
   */
  async delete(id: string, tx?: Transaction): Promise<boolean> {
    if (this.config.softDelete && "deletedAt" in this.table) {
      const row = await this.update(
        id,
        { deletedAt: new Date() } as Partial<InferSelectModel<TTable>>,
        tx,
      );
      return row !== undefined;
    }
    return this.hardDelete(id, tx);
  }

  /**
   * Restore a soft-deleted record.
   * Only available when soft delete is enabled.
   */
  async restore(id: string, tx?: Transaction): Promise<boolean> {
    if (!this.config.softDelete || !("deletedAt" in this.table)) {
      throw new Error("Restore is only available with soft delete enabled");
    }

    const executor = resolveExecutor(tx);

    const rows = await executor
      .update(this.table as AnyPgTable)
      .set({ deletedAt: null } as Record<string, unknown>)
      .where(eq(this.col("id"), id))
      .returning();

    return rows[0] !== undefined;
  }

  /**
   * Get a reference to the underlying Drizzle `db` or a given transaction.
   * Useful for complex queries that don't fit the base methods.
   */
  protected executor(tx?: Transaction) {
    return resolveExecutor(tx);
  }
}
