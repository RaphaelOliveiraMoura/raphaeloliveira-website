import { and, count, desc, eq, ilike, isNull, or, type SQL } from "drizzle-orm";

import type {
  Feedback,
  FeedbackResponse as FeedbackResponseRow,
  NewFeedback,
  NewFeedbackResponse,
} from "../../db/schema/feedback";
import {
  feedbackResponses,
  feedbacks,
  feedbackVotes,
} from "../../db/schema/feedback";
import type { Transaction } from "../../lib/transaction";
import { resolveExecutor } from "../../lib/transaction";

export class FeedbackRepository {
  /**
   * Create a new feedback entry.
   */
  async create(data: NewFeedback, tx?: Transaction): Promise<Feedback> {
    const executor = resolveExecutor(tx);
    const [feedback] = await executor
      .insert(feedbacks)
      .values(data)
      .returning();
    return feedback!;
  }

  /**
   * Find a feedback by ID (excluding soft-deleted).
   */
  async findById(id: string, tx?: Transaction): Promise<Feedback | undefined> {
    const executor = resolveExecutor(tx);
    const [feedback] = await executor
      .select()
      .from(feedbacks)
      .where(and(eq(feedbacks.id, id), isNull(feedbacks.deletedAt)))
      .limit(1);
    return feedback;
  }

  /**
   * List feedbacks with pagination and filters.
   */
  async findMany(
    options: {
      offset: number;
      limit: number;
      userId?: string;
      type?: string;
      status?: string;
      priority?: string;
      search?: string;
    },
    tx?: Transaction,
  ): Promise<{ data: Feedback[]; total: number }> {
    const executor = resolveExecutor(tx);
    const conditions: SQL[] = [isNull(feedbacks.deletedAt)];

    if (options.userId) {
      conditions.push(eq(feedbacks.userId, options.userId));
    }

    if (options.type) {
      conditions.push(
        eq(
          feedbacks.type,
          options.type as
            | "bug"
            | "feature_request"
            | "improvement"
            | "question",
        ),
      );
    }

    if (options.status) {
      conditions.push(
        eq(
          feedbacks.status,
          options.status as
            | "open"
            | "under_review"
            | "planned"
            | "in_progress"
            | "resolved"
            | "closed",
        ),
      );
    }

    if (options.priority) {
      conditions.push(
        eq(
          feedbacks.priority,
          options.priority as "low" | "medium" | "high" | "critical",
        ),
      );
    }

    if (options.search) {
      const search = `%${options.search}%`;
      conditions.push(
        or(
          ilike(feedbacks.title, search),
          ilike(feedbacks.description, search),
        )!,
      );
    }

    const where = and(...conditions);

    const [data, countResult] = await Promise.all([
      executor
        .select()
        .from(feedbacks)
        .where(where)
        .orderBy(desc(feedbacks.createdAt))
        .limit(options.limit)
        .offset(options.offset),
      executor.select({ count: count() }).from(feedbacks).where(where),
    ]);

    return {
      data,
      total: countResult[0]?.count ?? 0,
    };
  }

  /**
   * Update a feedback by ID.
   */
  async update(
    id: string,
    data: Partial<Feedback>,
    tx?: Transaction,
  ): Promise<Feedback | undefined> {
    const executor = resolveExecutor(tx);
    const [feedback] = await executor
      .update(feedbacks)
      .set(data)
      .where(and(eq(feedbacks.id, id), isNull(feedbacks.deletedAt)))
      .returning();
    return feedback;
  }

  /**
   * Soft delete a feedback by ID.
   */
  async softDelete(id: string, tx?: Transaction): Promise<boolean> {
    const executor = resolveExecutor(tx);
    const [result] = await executor
      .update(feedbacks)
      .set({ deletedAt: new Date() })
      .where(and(eq(feedbacks.id, id), isNull(feedbacks.deletedAt)))
      .returning({ id: feedbacks.id });
    return !!result;
  }

  // ---- Responses ----

  /**
   * Add a response to a feedback.
   */
  async createResponse(
    data: NewFeedbackResponse,
    tx?: Transaction,
  ): Promise<FeedbackResponseRow> {
    const executor = resolveExecutor(tx);
    const [response] = await executor
      .insert(feedbackResponses)
      .values(data)
      .returning();
    return response!;
  }

  /**
   * Get all responses for a feedback (optionally excluding internal ones).
   */
  async findResponsesByFeedbackId(
    feedbackId: string,
    includeInternal: boolean,
    tx?: Transaction,
  ): Promise<FeedbackResponseRow[]> {
    const executor = resolveExecutor(tx);
    const conditions: SQL[] = [eq(feedbackResponses.feedbackId, feedbackId)];

    if (!includeInternal) {
      conditions.push(eq(feedbackResponses.isInternal, false));
    }

    return executor
      .select()
      .from(feedbackResponses)
      .where(and(...conditions))
      .orderBy(feedbackResponses.createdAt);
  }

  // ---- Votes ----

  /**
   * Toggle a vote on a feedback. Returns true if vote was added, false if removed.
   */
  async toggleVote(
    feedbackId: string,
    userId: string,
    tx?: Transaction,
  ): Promise<boolean> {
    const executor = resolveExecutor(tx);

    // Check if vote exists
    const [existing] = await executor
      .select()
      .from(feedbackVotes)
      .where(
        and(
          eq(feedbackVotes.feedbackId, feedbackId),
          eq(feedbackVotes.userId, userId),
        ),
      )
      .limit(1);

    if (existing) {
      // Remove vote
      await executor
        .delete(feedbackVotes)
        .where(eq(feedbackVotes.id, existing.id));
      return false;
    }

    // Add vote
    await executor.insert(feedbackVotes).values({ feedbackId, userId });
    return true;
  }

  /**
   * Get the vote count for a feedback.
   */
  async getVoteCount(feedbackId: string, tx?: Transaction): Promise<number> {
    const executor = resolveExecutor(tx);
    const [result] = await executor
      .select({ count: count() })
      .from(feedbackVotes)
      .where(eq(feedbackVotes.feedbackId, feedbackId));
    return result?.count ?? 0;
  }

  /**
   * Check if a user has voted on a feedback.
   */
  async hasVoted(
    feedbackId: string,
    userId: string,
    tx?: Transaction,
  ): Promise<boolean> {
    const executor = resolveExecutor(tx);
    const [result] = await executor
      .select({ count: count() })
      .from(feedbackVotes)
      .where(
        and(
          eq(feedbackVotes.feedbackId, feedbackId),
          eq(feedbackVotes.userId, userId),
        ),
      );
    return (result?.count ?? 0) > 0;
  }

  // ---- Stats ----

  /**
   * Get aggregated feedback statistics.
   */
  async getStats(tx?: Transaction): Promise<{
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    total: number;
  }> {
    const executor = resolveExecutor(tx);

    const allFeedbacks = await executor
      .select({
        type: feedbacks.type,
        status: feedbacks.status,
      })
      .from(feedbacks)
      .where(isNull(feedbacks.deletedAt));

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    for (const fb of allFeedbacks) {
      byType[fb.type] = (byType[fb.type] ?? 0) + 1;
      byStatus[fb.status] = (byStatus[fb.status] ?? 0) + 1;
    }

    return {
      byType,
      byStatus,
      total: allFeedbacks.length,
    };
  }
}
