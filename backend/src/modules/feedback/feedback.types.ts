export interface FeedbackDTO {
  id: string;
  userId: string;
  type: string;
  status: string;
  priority: string;
  title: string;
  description: string;
  metadata: Record<string, unknown> | null;
  adminNotes: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  voteCount?: number;
  hasVoted?: boolean;
}

export interface FeedbackDetailDTO extends FeedbackDTO {
  responses: FeedbackResponseDTO[];
  voteCount: number;
  hasVoted: boolean;
}

export interface FeedbackResponseDTO {
  id: string;
  feedbackId: string;
  userId: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

export interface FeedbackStatsDTO {
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  total: number;
}
