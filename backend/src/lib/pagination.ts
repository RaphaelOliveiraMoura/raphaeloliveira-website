import { z } from "zod";

import { PAGINATION } from "../config/constants";

// ---- Offset-based pagination ----

/**
 * Zod schema for pagination query parameters.
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Calculate offset from page and limit.
 */
export function getOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Build a paginated response object.
 */
export function paginate<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ---- Cursor-based pagination ----

/**
 * Zod schema for cursor-based pagination query parameters.
 */
export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT),
});

export type CursorPaginationQuery = z.infer<typeof cursorPaginationSchema>;

export interface CursorPaginatedResponse<T> {
  data: T[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}

/**
 * Encode cursor data as an opaque base64 string.
 *
 * @example
 * ```ts
 * const cursor = encodeCursor({ id: "abc", createdAt: "2024-01-01" });
 * // → "eyJpZCI6ImFiYyIsImNyZWF0ZWRBdCI6IjIwMjQtMDEtMDEifQ=="
 * ```
 */
export function encodeCursor(value: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

/**
 * Decode an opaque cursor string back to its original data.
 * Returns `null` if decoding fails.
 */
export function decodeCursor(cursor: string): Record<string, unknown> | null {
  try {
    const json = Buffer.from(cursor, "base64url").toString("utf-8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Build a cursor-paginated response from query results.
 *
 * Expects the query to fetch `limit + 1` rows. The extra row is used
 * to determine if there are more results (`hasMore`).
 *
 * @param data - Query results (should be `limit + 1` rows if there are more).
 * @param limit - The requested page size.
 * @param cursorKey - Key in the data to use as cursor value.
 *
 * @example
 * ```ts
 * // In your repository:
 * const rows = await db.select().from(users).limit(limit + 1).where(...);
 * return cursorPaginate(rows, limit, "id");
 * ```
 */
export function cursorPaginate<T>(
  data: T[],
  limit: number,
  cursorKey: keyof T,
): CursorPaginatedResponse<T> {
  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;

  const lastItem = items[items.length - 1];
  const nextCursor =
    hasMore && lastItem
      ? encodeCursor({ [cursorKey as string]: lastItem[cursorKey] })
      : null;

  return {
    data: items,
    meta: {
      nextCursor,
      hasMore,
      limit,
    },
  };
}
