// ============================================================================
// Tipos compartilhados para respostas da API do backend Fastify
// ============================================================================

// --- Paginacao ---

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface FlatPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// --- Auth ---

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface MeResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface RefreshResponse {
  accessToken: string;
}

// --- Users ---

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export type UsersListResponse = PaginatedResponse<UserResponse>;

export interface ListUsersParams extends PaginationParams {
  search?: string;
  role?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "user";
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: "admin" | "user";
}

// --- Sessions ---

export interface SessionResponse {
  id: string;
  ip: string | null;
  userAgent: string | null;
  deviceName: string | null;
  lastActiveAt: string | null;
  createdAt: string;
  isCurrent: boolean;
}

export type SessionsListResponse = FlatPaginatedResponse<SessionResponse>;

// --- API Keys ---

export interface ApiKeyResponse {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface CreateApiKeyResponse extends ApiKeyResponse {
  key: string;
}

export interface ApiKeysListResponse {
  data: ApiKeyResponse[];
  total: number;
}

export interface CreateApiKeyPayload {
  name: string;
  scopes?: string[];
  expiresAt?: string;
}

// --- Roles & Permissions ---

export interface PermissionResponse {
  id: string;
  key: string;
  description: string | null;
  resource: string;
  action: string;
}

export interface RoleResponse {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: PermissionResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
}

export interface SetPermissionsPayload {
  permissionIds: string[];
}

// --- Audit ---

export interface AuditLogResponse {
  id: string;
  action: string;
  actorId: string | null;
  actorEmail: string | null;
  resourceType: string | null;
  resourceId: string | null;
  changes: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

export type AuditLogsListResponse = PaginatedResponse<AuditLogResponse>;

export interface ListAuditLogsParams extends PaginationParams {
  action?: string;
  actorId?: string;
  resourceType?: string;
  resourceId?: string;
  search?: string;
}

// --- Notifications ---

export interface NotificationResponse {
  id: string;
  type: string;
  channel: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}

export type NotificationsListResponse =
  FlatPaginatedResponse<NotificationResponse>;

export interface ListNotificationsParams extends PaginationParams {
  status?: "all" | "read" | "unread";
}

export interface UnreadCountResponse {
  count: number;
}

export interface NotificationPreference {
  channel: string;
  inApp: boolean;
  email: boolean;
}

// --- Feature Flags ---

export interface FeatureFlagConditions {
  roles?: string[];
  userIds?: string[];
  percentage?: number;
  environments?: string[];
}

export interface FeatureFlagResponse {
  id: string;
  key: string;
  description: string | null;
  enabled: boolean;
  conditions: FeatureFlagConditions | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeatureFlagPayload {
  key: string;
  description?: string;
  enabled?: boolean;
  conditions?: FeatureFlagConditions;
}

export interface UpdateFeatureFlagPayload {
  description?: string;
  enabled?: boolean;
  conditions?: FeatureFlagConditions;
}

export type EvaluateFlagsResponse = Record<string, boolean>;

// --- Settings ---

export interface SettingResponse {
  key: string;
  value: unknown;
  source: "system" | "user";
  updatedAt: string;
}

export interface UpdateSettingPayload {
  key: string;
  value: unknown;
}

// --- Webhooks ---

export interface WebhookResponse {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebhookResponse extends WebhookResponse {
  secret: string;
}

export interface WebhookDeliveryResponse {
  id: string;
  event: string;
  payload: Record<string, unknown>;
  statusCode: number | null;
  responseBody: string | null;
  attempts: number;
  deliveredAt: string | null;
  failedAt: string | null;
  createdAt: string;
}

export type WebhookDeliveriesListResponse =
  FlatPaginatedResponse<WebhookDeliveryResponse>;

export interface CreateWebhookPayload {
  url: string;
  events: string[];
  description?: string;
}

export interface UpdateWebhookPayload {
  url?: string;
  events?: string[];
  active?: boolean;
  description?: string;
}

// --- Uploads ---

export interface UploadResponse {
  id: string;
  key: string;
  originalName: string;
  contentType: string;
  size: number;
  uploadedBy: string | null;
  url: string | null;
  createdAt: string;
}

export type UploadsListResponse = PaginatedResponse<UploadResponse>;

export interface ListUploadsParams extends PaginationParams {
  search?: string;
}

// --- Search ---

export interface SearchResultItem {
  type: string;
  id: string;
  title: string;
  subtitle: string | null;
  rank: number;
}

export interface SearchResponse {
  results: SearchResultItem[];
  total: number;
}

export interface SearchParams {
  q: string;
  types?: string;
  limit?: number;
}

// --- Feedback ---

export type FeedbackType =
  | "bug"
  | "feature_request"
  | "improvement"
  | "question";
export type FeedbackStatus =
  | "open"
  | "under_review"
  | "planned"
  | "in_progress"
  | "resolved"
  | "closed";
export type FeedbackPriority = "low" | "medium" | "high" | "critical";

export interface FeedbackResponse {
  id: string;
  userId: string;
  type: FeedbackType;
  status: FeedbackStatus;
  priority: FeedbackPriority;
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

export interface FeedbackResponseItem {
  id: string;
  feedbackId: string;
  userId: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

export interface FeedbackDetailResponse extends FeedbackResponse {
  responses: FeedbackResponseItem[];
  voteCount: number;
  hasVoted: boolean;
}

export type FeedbackListResponse = PaginatedResponse<FeedbackResponse>;

export interface ListFeedbackParams extends PaginationParams {
  type?: FeedbackType;
  status?: FeedbackStatus;
  priority?: FeedbackPriority;
  search?: string;
}

export interface CreateFeedbackPayload {
  type: FeedbackType;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateFeedbackPayload {
  title?: string;
  description?: string;
  status?: FeedbackStatus;
  priority?: FeedbackPriority;
  adminNotes?: string;
}

export interface CreateFeedbackResponsePayload {
  message: string;
  isInternal?: boolean;
}

export interface FeedbackStatsResponse {
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  total: number;
}

// --- Health ---

export interface HealthResponse {
  status: "ok" | "degraded";
  timestamp: string;
  uptime: number;
  database: "connected" | "disconnected";
}

export interface LivenessResponse {
  status: "alive";
  timestamp: string;
  uptime: number;
  memory: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
  };
}

export interface ReadinessResponse {
  status: "ready" | "not_ready";
  timestamp: string;
  checks: {
    database: { status?: string; latencyMs?: number };
    mail: { status: string };
    storage: { status: string };
  };
}
