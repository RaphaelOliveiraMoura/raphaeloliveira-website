import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { PgQueryResultHKT, PgTransaction } from "drizzle-orm/pg-core";

import { db } from "../db/index";
import type * as schema from "../db/schema/index";

/**
 * Transaction type compatible with all repository methods.
 * Repositories accept `tx?: Transaction` to participate in composed transactions.
 */
export type Transaction = PgTransaction<
  PgQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

/** Executable database interface — either the main `db` or a `Transaction`. */
export type DatabaseExecutor = typeof db | Transaction;

/**
 * Execute a function within a database transaction.
 *
 * @example
 * ```ts
 * const user = await withTransaction(async (tx) => {
 *   const user = await usersRepo.create(data, tx);
 *   await auditRepo.log("user.created", user.id, tx);
 *   return user;
 * });
 * ```
 */
export async function withTransaction<T>(
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => fn(tx));
}

/**
 * Resolve the executor to use — transaction if provided, otherwise the global `db`.
 *
 * Useful inside repository methods:
 * ```ts
 * async findById(id: string, tx?: Transaction) {
 *   const executor = resolveExecutor(tx);
 *   return executor.select()...
 * }
 * ```
 */
export function resolveExecutor(tx?: Transaction): DatabaseExecutor {
  return tx ?? db;
}
