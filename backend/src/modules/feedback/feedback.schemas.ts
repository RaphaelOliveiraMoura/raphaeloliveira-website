import { z } from "zod";

import { paginationSchema } from "../../lib/pagination";

// ---- Shared enums ----

const feedbackTypeEnum = z.enum([
  "bug",
  "feature_request",
  "improvement",
  "question",
]);

const feedbackStatusEnum = z.enum([
  "open",
  "under_review",
  "planned",
  "in_progress",
  "resolved",
  "closed",
]);

const feedbackPriorityEnum = z.enum(["low", "medium", "high", "critical"]);

// ---- Request schemas ----

export const createFeedbackSchema = z.object({
  type: feedbackTypeEnum,
  title: z.string().min(3).max(255),
  description: z.string().min(10).max(10000),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateFeedbackSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().min(10).max(10000).optional(),
  // Admin-only fields (enforced in route handler)
  status: feedbackStatusEnum.optional(),
  priority: feedbackPriorityEnum.optional(),
  adminNotes: z.string().max(5000).nullable().optional(),
});

export const listFeedbackQuerySchema = paginationSchema.extend({
  type: feedbackTypeEnum.optional(),
  status: feedbackStatusEnum.optional(),
  priority: feedbackPriorityEnum.optional(),
  search: z.string().optional(),
});

export const feedbackParamsSchema = z.object({
  id: z.string().uuid(),
});

export const createResponseSchema = z.object({
  message: z.string().min(1).max(5000),
  isInternal: z.boolean().optional().default(false),
});

// ---- Response schemas ----

export const feedbackResponseItemSchema = z.object({
  id: z.string().uuid(),
  feedbackId: z.string().uuid(),
  userId: z.string().uuid(),
  message: z.string(),
  isInternal: z.boolean(),
  createdAt: z.string(),
});

export const feedbackResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.string(),
  status: z.string(),
  priority: z.string(),
  title: z.string(),
  description: z.string(),
  metadata: z.unknown().nullable(),
  adminNotes: z.string().nullable(),
  resolvedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  voteCount: z.number().optional(),
  hasVoted: z.boolean().optional(),
});

export const feedbackDetailResponseSchema = feedbackResponseSchema.extend({
  responses: z.array(feedbackResponseItemSchema),
  voteCount: z.number(),
  hasVoted: z.boolean(),
});

export const feedbackListResponseSchema = z.object({
  data: z.array(feedbackResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const feedbackStatsResponseSchema = z.object({
  byType: z.record(z.string(), z.number()),
  byStatus: z.record(z.string(), z.number()),
  total: z.number(),
});

// ---- Inferred types ----

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
export type UpdateFeedbackInput = z.infer<typeof updateFeedbackSchema>;
export type ListFeedbackQuery = z.infer<typeof listFeedbackQuerySchema>;
export type CreateResponseInput = z.infer<typeof createResponseSchema>;
