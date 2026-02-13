import { isNotNull, isNull, type SQL } from "drizzle-orm";
import { timestamp } from "drizzle-orm/pg-core";

/**
 * Reusable `deletedAt` column definition for soft-deletable tables.
 *
 * @example
 * ```ts
 * export const users = pgTable("users", {
 *   id: uuid("id").defaultRandom().primaryKey(),
 *   ...softDeleteColumns,
 * });
 * ```
 */
export const softDeleteColumns = {
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
} as const;

/**
 * Build a WHERE condition that excludes soft-deleted records.
 *
 * @example
 * ```ts
 * db.select().from(users).where(notDeleted(users.deletedAt));
 * ```
 */
export function notDeleted(deletedAtColumn: SQL<unknown>): SQL {
  return isNull(deletedAtColumn);
}

/**
 * Build a WHERE condition that includes ONLY soft-deleted records.
 *
 * @example
 * ```ts
 * db.select().from(users).where(onlyDeleted(users.deletedAt));
 * ```
 */
export function onlyDeleted(deletedAtColumn: SQL<unknown>): SQL {
  return isNotNull(deletedAtColumn);
}
