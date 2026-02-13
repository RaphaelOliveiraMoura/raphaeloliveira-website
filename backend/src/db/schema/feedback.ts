import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users";

// ---- Enums ----

export const feedbackTypeEnum = pgEnum("feedback_type", [
  "bug",
  "feature_request",
  "improvement",
  "question",
]);

export const feedbackStatusEnum = pgEnum("feedback_status", [
  "open",
  "under_review",
  "planned",
  "in_progress",
  "resolved",
  "closed",
]);

export const feedbackPriorityEnum = pgEnum("feedback_priority", [
  "low",
  "medium",
  "high",
  "critical",
]);

// ---- Tables ----

export const feedbacks = pgTable("feedbacks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: feedbackTypeEnum("type").notNull(),
  status: feedbackStatusEnum("status").notNull().default("open"),
  priority: feedbackPriorityEnum("priority").notNull().default("medium"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  adminNotes: text("admin_notes"),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const feedbackResponses = pgTable("feedback_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  feedbackId: uuid("feedback_id")
    .notNull()
    .references(() => feedbacks.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  isInternal: boolean("is_internal").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const feedbackVotes = pgTable(
  "feedback_votes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    feedbackId: uuid("feedback_id")
      .notNull()
      .references(() => feedbacks.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    unique: unique().on(t.feedbackId, t.userId),
  }),
);

// ---- Types ----

export type Feedback = typeof feedbacks.$inferSelect;
export type NewFeedback = typeof feedbacks.$inferInsert;
export type FeedbackResponse = typeof feedbackResponses.$inferSelect;
export type NewFeedbackResponse = typeof feedbackResponses.$inferInsert;
export type FeedbackVote = typeof feedbackVotes.$inferSelect;
export type NewFeedbackVote = typeof feedbackVotes.$inferInsert;

export type FeedbackType = Feedback["type"];
export type FeedbackStatus = Feedback["status"];
export type FeedbackPriority = Feedback["priority"];
