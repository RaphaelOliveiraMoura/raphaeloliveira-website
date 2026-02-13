import { z } from "zod";

import { paginationSchema } from "../../lib/pagination";

export const createWebhookSchema = z.object({
  url: z.string().url().max(2048),
  events: z.array(z.string()).min(1),
  description: z.string().max(500).optional(),
});

export const updateWebhookSchema = z.object({
  url: z.string().url().max(2048).optional(),
  events: z.array(z.string()).min(1).optional(),
  active: z.boolean().optional(),
  description: z.string().max(500).optional(),
});

export const webhookResponseSchema = z.object({
  id: z.string().uuid(),
  url: z.string(),
  events: z.array(z.string()),
  active: z.boolean(),
  description: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const webhookDeliveryResponseSchema = z.object({
  id: z.string().uuid(),
  event: z.string(),
  payload: z.unknown(),
  statusCode: z.number().nullable(),
  responseBody: z.string().nullable(),
  attempts: z.number(),
  deliveredAt: z.string().nullable(),
  failedAt: z.string().nullable(),
  createdAt: z.string(),
});

export const listDeliveriesSchema = paginationSchema;

export const listDeliveriesResponseSchema = z.object({
  data: z.array(webhookDeliveryResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
export type UpdateWebhookInput = z.infer<typeof updateWebhookSchema>;
