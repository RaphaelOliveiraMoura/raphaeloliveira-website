import { z } from "zod";

import { paginationSchema } from "../../lib/pagination";

// ---- Constants ----

/** Maximum file size: 10 MB */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Allowed MIME types */
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "text/csv",
  "application/json",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

// ---- Request schemas ----

export const uploadParamsSchema = z.object({
  id: z.string().uuid(),
});

export const listUploadsQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
});

// ---- Response schemas ----

export const uploadResponseSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  originalName: z.string(),
  contentType: z.string(),
  size: z.number(),
  uploadedBy: z.string().uuid().nullable(),
  url: z.string().optional(),
  createdAt: z.string(),
});

export const uploadsListResponseSchema = z.object({
  data: z.array(uploadResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

// ---- Inferred types ----

export type ListUploadsQuery = z.infer<typeof listUploadsQuerySchema>;
