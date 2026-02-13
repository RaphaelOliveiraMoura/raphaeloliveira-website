import { z } from "zod";

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(255),
  scopes: z.array(z.string()).default([]),
  expiresAt: z.string().datetime().optional(),
});

export const apiKeyResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  prefix: z.string(),
  scopes: z.array(z.string()),
  expiresAt: z.string().nullable(),
  lastUsedAt: z.string().nullable(),
  createdAt: z.string(),
});

export const createApiKeyResponseSchema = apiKeyResponseSchema.extend({
  /** The full API key — shown only once at creation time. */
  key: z.string(),
});

export const listApiKeysResponseSchema = z.object({
  data: z.array(apiKeyResponseSchema),
  total: z.number(),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
