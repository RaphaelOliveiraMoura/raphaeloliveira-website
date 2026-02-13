import { z } from "zod";

import { PAGINATION } from "../config/constants";

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
