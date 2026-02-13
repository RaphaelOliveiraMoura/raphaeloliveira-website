import { z } from "zod";

import { paginationSchema } from "../../lib/pagination";

export const listSessionsSchema = paginationSchema;

export const sessionResponseSchema = z.object({
  id: z.string().uuid(),
  ip: z.string().nullable(),
  userAgent: z.string().nullable(),
  deviceName: z.string().nullable(),
  lastActiveAt: z.string().nullable(),
  createdAt: z.string(),
  isCurrent: z.boolean(),
});

export const listSessionsResponseSchema = z.object({
  data: z.array(sessionResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});
