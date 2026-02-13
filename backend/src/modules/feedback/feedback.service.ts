import type { Feedback, FeedbackResponse } from "../../db/schema/feedback";
import { ForbiddenError, NotFoundError } from "../../lib/errors";
import { domainEvents } from "../../lib/events";
import {
  getOffset,
  paginate,
  type PaginatedResponse,
} from "../../lib/pagination";
import { FeedbackRepository } from "./feedback.repository";
import type {
  CreateFeedbackInput,
  CreateResponseInput,
  ListFeedbackQuery,
  UpdateFeedbackInput,
} from "./feedback.schemas";
import type {
  FeedbackDetailDTO,
  FeedbackDTO,
  FeedbackResponseDTO,
  FeedbackStatsDTO,
} from "./feedback.types";

function toDTO(feedback: Feedback): FeedbackDTO {
  return {
    id: feedback.id,
    userId: feedback.userId,
    type: feedback.type,
    status: feedback.status,
    priority: feedback.priority,
    title: feedback.title,
    description: feedback.description,
    metadata: feedback.metadata,
    adminNotes: feedback.adminNotes,
    resolvedAt: feedback.resolvedAt?.toISOString() ?? null,
    createdAt: feedback.createdAt.toISOString(),
    updatedAt: feedback.updatedAt.toISOString(),
  };
}

function toResponseDTO(response: FeedbackResponse): FeedbackResponseDTO {
  return {
    id: response.id,
    feedbackId: response.feedbackId,
    userId: response.userId,
    message: response.message,
    isInternal: response.isInternal,
    createdAt: response.createdAt.toISOString(),
  };
}

export class FeedbackService {
  private repository = new FeedbackRepository();

  /**
   * Create a new feedback.
   */
  async create(
    input: CreateFeedbackInput,
    userId: string,
  ): Promise<FeedbackDTO> {
    const feedback = await this.repository.create({
      userId,
      type: input.type,
      title: input.title,
      description: input.description,
      metadata: input.metadata ?? null,
    });

    domainEvents.emit("feedback.created", {
      feedbackId: feedback.id,
      userId,
      type: input.type,
    });

    return toDTO(feedback);
  }

  /**
   * List feedbacks with pagination and filters.
   * Users see only their own; admins see all.
   */
  async list(
    query: ListFeedbackQuery,
    userId: string,
    isAdmin: boolean,
  ): Promise<PaginatedResponse<FeedbackDTO>> {
    const offset = getOffset(query.page, query.limit);

    const { data, total } = await this.repository.findMany({
      offset,
      limit: query.limit,
      userId: isAdmin ? undefined : userId,
      type: query.type,
      status: query.status,
      priority: query.priority,
      search: query.search,
    });

    return paginate(data.map(toDTO), total, query.page, query.limit);
  }

  /**
   * Get a feedback by ID with responses, votes, and vote status.
   * Users can only see their own; admins can see all.
   */
  async getById(
    id: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<FeedbackDetailDTO> {
    const feedback = await this.repository.findById(id);
    if (!feedback) throw new NotFoundError("Feedback", id);

    // Non-admin users can only see their own feedback
    if (!isAdmin && feedback.userId !== userId) {
      throw new NotFoundError("Feedback", id);
    }

    const [responses, voteCount, hasVoted] = await Promise.all([
      this.repository.findResponsesByFeedbackId(id, isAdmin),
      this.repository.getVoteCount(id),
      this.repository.hasVoted(id, userId),
    ]);

    return {
      ...toDTO(feedback),
      responses: responses.map(toResponseDTO),
      voteCount,
      hasVoted,
    };
  }

  /**
   * Update a feedback.
   * Users can update title/description of their own.
   * Admins can update status/priority/adminNotes of any.
   */
  async update(
    id: string,
    input: UpdateFeedbackInput,
    userId: string,
    isAdmin: boolean,
  ): Promise<FeedbackDTO> {
    const feedback = await this.repository.findById(id);
    if (!feedback) throw new NotFoundError("Feedback", id);

    // Build update payload based on role
    const updateData: Record<string, unknown> = {};

    if (feedback.userId === userId || isAdmin) {
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined)
        updateData.description = input.description;
    }

    if (isAdmin) {
      if (input.status !== undefined) {
        updateData.status = input.status;

        // Set resolvedAt when status changes to resolved
        if (input.status === "resolved" && feedback.status !== "resolved") {
          updateData.resolvedAt = new Date();
        }
      }
      if (input.priority !== undefined) updateData.priority = input.priority;
      if (input.adminNotes !== undefined)
        updateData.adminNotes = input.adminNotes;
    } else if (
      input.status !== undefined ||
      input.priority !== undefined ||
      input.adminNotes !== undefined
    ) {
      throw new ForbiddenError(
        "Only admins can update status, priority, or admin notes",
      );
    }

    if (Object.keys(updateData).length === 0) {
      return toDTO(feedback);
    }

    const updated = await this.repository.update(id, updateData);
    if (!updated) throw new NotFoundError("Feedback", id);

    // Emit status change event
    if (input.status && input.status !== feedback.status) {
      domainEvents.emit("feedback.status.changed", {
        feedbackId: id,
        oldStatus: feedback.status,
        newStatus: input.status,
        changedBy: userId,
      });
    }

    return toDTO(updated);
  }

  /**
   * Soft delete a feedback.
   * Users can delete their own; admins can delete any.
   */
  async delete(id: string, userId: string, isAdmin: boolean): Promise<void> {
    const feedback = await this.repository.findById(id);
    if (!feedback) throw new NotFoundError("Feedback", id);

    if (!isAdmin && feedback.userId !== userId) {
      throw new ForbiddenError("You can only delete your own feedback");
    }

    const deleted = await this.repository.softDelete(id);
    if (!deleted) throw new NotFoundError("Feedback", id);
  }

  /**
   * Add a response to a feedback.
   */
  async addResponse(
    feedbackId: string,
    input: CreateResponseInput,
    userId: string,
    isAdmin: boolean,
  ): Promise<FeedbackResponseDTO> {
    const feedback = await this.repository.findById(feedbackId);
    if (!feedback) throw new NotFoundError("Feedback", feedbackId);

    // Only admins can create internal notes
    if (input.isInternal && !isAdmin) {
      throw new ForbiddenError("Only admins can create internal notes");
    }

    const response = await this.repository.createResponse({
      feedbackId,
      userId,
      message: input.message,
      isInternal: input.isInternal,
    });

    domainEvents.emit("feedback.response.added", {
      feedbackId,
      responseId: response.id,
      userId,
      isInternal: response.isInternal,
    });

    return toResponseDTO(response);
  }

  /**
   * Toggle a vote on a feedback.
   */
  async toggleVote(
    feedbackId: string,
    userId: string,
  ): Promise<{ voted: boolean; voteCount: number }> {
    const feedback = await this.repository.findById(feedbackId);
    if (!feedback) throw new NotFoundError("Feedback", feedbackId);

    const voted = await this.repository.toggleVote(feedbackId, userId);
    const voteCount = await this.repository.getVoteCount(feedbackId);

    return { voted, voteCount };
  }

  /**
   * Get feedback statistics (admin only).
   */
  async getStats(): Promise<FeedbackStatsDTO> {
    return this.repository.getStats();
  }
}
