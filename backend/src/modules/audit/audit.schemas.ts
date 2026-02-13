import { z } from "zod";

import { paginationSchema } from "../../lib/pagination";

// ---- Request schemas ----

export const listAuditLogsQuerySchema = paginationSchema.extend({
  action: z.string().optional(),
  actorId: z.string().uuid().optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  search: z.string().optional(),
});

// ---- Response schemas ----

export const auditLogResponseSchema = z.object({
  id: z.string().uuid(),
  action: z.string(),
  actorId: z.string().uuid().nullable(),
  actorEmail: z.string().nullable(),
  resourceType: z.string().nullable(),
  resourceId: z.string().nullable(),
  changes: z.unknown().nullable(),
  metadata: z.unknown().nullable(),
  ip: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.string(),
});

export const auditLogsListResponseSchema = z.object({
  data: z.array(auditLogResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

// ---- Inferred types ----

export type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuerySchema>;
