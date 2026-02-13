import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  type SQL,
} from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { z } from "zod";

import { buildFullTextSearch } from "./full-text-search";
import { paginationSchema } from "./pagination";

// ---- Schema helpers ----

/**
 * Create a list query schema with sorting and ordering.
 *
 * @example
 * ```ts
 * const listUsersSchema = createListSchema(
 *   ["createdAt", "name", "email"],
 *   "createdAt",
 * ).extend({
 *   search: z.string().optional(),
 *   role: z.enum(["admin", "user"]).optional(),
 * });
 * ```
 */
export function createListSchema<T extends string>(
  sortFields: readonly [T, ...T[]],
  defaultSort: NoInfer<T> = sortFields[0],
) {
  return paginationSchema.extend({
    sort: z.enum(sortFields).default(defaultSort),
    order: z.enum(["asc", "desc"]).default("desc"),
  });
}

// ---- Filter builders ----

/**
 * Operator types supported by the query builder.
 */
export type FilterOperator = "eq" | "ilike" | "gte" | "lte" | "in";

/**
 * Definition of a filter to apply.
 */
export interface FilterDefinition {
  column: PgColumn;
  operator: FilterOperator;
  value: unknown;
}

/**
 * Build a single SQL condition from a filter definition.
 */
function buildCondition(filter: FilterDefinition): SQL | undefined {
  const { column, operator, value } = filter;

  if (value === undefined || value === null || value === "") return undefined;

  switch (operator) {
    case "eq":
      return eq(column, value as string);
    case "ilike":
      return ilike(column, `%${value as string}%`);
    case "gte":
      return gte(column, value as string);
    case "lte":
      return lte(column, value as string);
    case "in": {
      const arr = Array.isArray(value) ? value : [value];
      return arr.length > 0 ? inArray(column, arr) : undefined;
    }
    default:
      return undefined;
  }
}

/**
 * Build a combined WHERE clause from multiple filter definitions.
 * All conditions are ANDed together.
 *
 * @example
 * ```ts
 * const where = buildFilters([
 *   { column: users.role, operator: "eq", value: query.role },
 *   { column: users.createdAt, operator: "gte", value: query.createdAfter },
 * ]);
 * ```
 */
export function buildFilters(filters: FilterDefinition[]): SQL | undefined {
  const conditions = filters
    .map(buildCondition)
    .filter((c): c is SQL => c !== undefined);

  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  return and(...conditions);
}

/**
 * Build a search condition that ORs across multiple columns with ILIKE.
 *
 * @example
 * ```ts
 * const searchWhere = buildSearch("john", [users.name, users.email]);
 * ```
 */
export function buildSearch(
  term: string | undefined,
  columns: PgColumn[],
): SQL | undefined {
  if (!term || columns.length === 0) return undefined;

  const pattern = `%${term}%`;
  const conditions = columns.map((col) => ilike(col, pattern));

  if (conditions.length === 1) return conditions[0];
  return or(...conditions);
}

/**
 * Build a dynamic ORDER BY clause from sort field and direction.
 *
 * @example
 * ```ts
 * const orderBy = buildOrderBy("createdAt", "desc", {
 *   createdAt: users.createdAt,
 *   name: users.name,
 *   email: users.email,
 * });
 * ```
 */
export function buildOrderBy(
  sort: string,
  order: "asc" | "desc",
  columnMap: Record<string, PgColumn>,
): SQL | undefined {
  const column = columnMap[sort];
  if (!column) return undefined;

  return order === "asc" ? asc(column) : desc(column);
}

/**
 * Combine search and filter conditions into a single WHERE clause.
 */
export function combineConditions(
  ...conditions: (SQL | undefined)[]
): SQL | undefined {
  const valid = conditions.filter((c): c is SQL => c !== undefined);

  if (valid.length === 0) return undefined;
  if (valid.length === 1) return valid[0];
  return and(...valid);
}

/**
 * Build a search condition using full-text search (tsvector/tsquery)
 * with ILIKE fallback for short queries.
 *
 * Uses PostgreSQL full-text search for terms with 3+ characters,
 * falls back to ILIKE for shorter terms.
 *
 * @example
 * ```ts
 * const where = buildSmartSearch("john doe", [users.name, users.email]);
 * ```
 */
export function buildSmartSearch(
  term: string | undefined,
  columns: PgColumn[],
  options?: { fullTextConfig?: string; minFullTextLength?: number },
): SQL | undefined {
  if (!term || columns.length === 0) return undefined;

  const minLength = options?.minFullTextLength ?? 3;

  if (term.trim().length >= minLength) {
    const ftsResult = buildFullTextSearch(
      term,
      columns,
      options?.fullTextConfig,
    );
    if (ftsResult) return ftsResult;
  }

  // Fallback to ILIKE for short terms
  return buildSearch(term, columns);
}

// ---- JOIN result helpers ----

/**
 * Group flattened LEFT JOIN rows into parent entities with nested child arrays.
 *
 * Solves the classic SQL JOIN problem where a parent with N children
 * produces N rows. This function de-duplicates parents and groups
 * their children into arrays.
 *
 * @param rows - Flattened rows from a LEFT JOIN query.
 * @param parentKey - Key that uniquely identifies the parent (e.g., "id").
 * @param childFields - Object mapping child array name to child key prefix.
 *
 * @example
 * ```ts
 * // Query with LEFT JOIN returns flattened rows:
 * const rows = [
 *   { id: "1", name: "Admin", permId: "p1", permKey: "users.read" },
 *   { id: "1", name: "Admin", permId: "p2", permKey: "users.write" },
 *   { id: "2", name: "User",  permId: null,  permKey: null },
 * ];
 *
 * const grouped = groupJoinResults(rows, "id", {
 *   permissions: { idKey: "permId", fields: ["permId", "permKey"] },
 * });
 *
 * // Result:
 * // [
 * //   { id: "1", name: "Admin", permissions: [{ permId: "p1", permKey: "users.read" }, ...] },
 * //   { id: "2", name: "User", permissions: [] },
 * // ]
 * ```
 */
export function groupJoinResults<TRow extends Record<string, unknown>>(
  rows: TRow[],
  parentKey: keyof TRow,
  childGroups: Record<string, { idKey: keyof TRow; fields: (keyof TRow)[] }>,
): Record<string, unknown>[] {
  const parentMap = new Map<
    unknown,
    { parent: Record<string, unknown>; children: Record<string, unknown[]> }
  >();

  // Get all child field keys for exclusion from parent
  const childFieldKeys = new Set<keyof TRow>();
  for (const group of Object.values(childGroups)) {
    for (const field of group.fields) {
      childFieldKeys.add(field);
    }
  }

  for (const row of rows) {
    const parentId = row[parentKey];

    if (!parentMap.has(parentId)) {
      // Extract parent fields (exclude child fields)
      const parent: Record<string, unknown> = {};
      for (const key of Object.keys(row)) {
        if (!childFieldKeys.has(key as keyof TRow)) {
          parent[key] = row[key];
        }
      }

      // Initialize child arrays
      const children: Record<string, unknown[]> = {};
      for (const groupName of Object.keys(childGroups)) {
        children[groupName] = [];
      }

      parentMap.set(parentId, { parent, children });
    }

    const entry = parentMap.get(parentId)!;

    // Extract child rows for each group
    for (const [groupName, config] of Object.entries(childGroups)) {
      const childId = row[config.idKey];
      // Skip null children (LEFT JOIN with no match)
      if (childId === null || childId === undefined) continue;

      // Avoid duplicates
      const existing = entry.children[groupName]!;
      const alreadyAdded = existing.some(
        (c) =>
          (c as Record<string, unknown>)[config.idKey as string] === childId,
      );
      if (alreadyAdded) continue;

      const child: Record<string, unknown> = {};
      for (const field of config.fields) {
        child[field as string] = row[field];
      }
      existing.push(child);
    }
  }

  // Merge parent with children arrays
  return Array.from(parentMap.values()).map(({ parent, children }) => ({
    ...parent,
    ...children,
  }));
}
