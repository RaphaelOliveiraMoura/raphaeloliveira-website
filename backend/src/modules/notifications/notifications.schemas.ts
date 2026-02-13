import { z } from "zod";

import { paginationSchema } from "../../lib/pagination";

export const listNotificationsSchema = paginationSchema.extend({
  status: z.enum(["all", "read", "unread"]).default("all"),
});

export const notificationResponseSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  channel: z.string(),
  title: z.string(),
  body: z.string().nullable(),
  data: z.unknown().nullable(),
  readAt: z.string().nullable(),
  createdAt: z.string(),
});

export const listNotificationsResponseSchema = z.object({
  data: z.array(notificationResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export const unreadCountResponseSchema = z.object({
  count: z.number(),
});

export const updatePreferencesSchema = z.array(
  z.object({
    channel: z.string(),
    inApp: z.boolean(),
    email: z.boolean(),
  }),
);

export const preferenceResponseSchema = z.object({
  channel: z.string(),
  inApp: z.boolean(),
  email: z.boolean(),
});
