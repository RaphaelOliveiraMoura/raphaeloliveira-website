import { z } from "zod";

// ---- Request schemas ----

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(255),
  types: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
    ),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

// ---- Response schemas ----

export const searchResultItemSchema = z.object({
  type: z.string(),
  id: z.string(),
  title: z.string(),
  subtitle: z.string().nullable(),
  rank: z.number(),
});

export const searchResponseSchema = z.object({
  results: z.array(searchResultItemSchema),
  total: z.number(),
});

// ---- Inferred types ----

export type SearchQuery = z.infer<typeof searchQuerySchema>;
