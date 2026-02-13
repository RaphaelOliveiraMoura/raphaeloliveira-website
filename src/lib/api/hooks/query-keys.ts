/**
 * Chaves centralizadas para React Query.
 * Facilita invalidacao e prefetch consistentes.
 */
export const queryKeys = {
  users: {
    all: ["users"] as const,
    list: (params?: object) => ["users", "list", params] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },
  sessions: {
    all: ["sessions"] as const,
    list: () => ["sessions", "list"] as const,
  },
  apiKeys: {
    all: ["api-keys"] as const,
    list: () => ["api-keys", "list"] as const,
  },
  roles: {
    all: ["roles"] as const,
    list: () => ["roles", "list"] as const,
    permissions: () => ["roles", "permissions"] as const,
  },
  audit: {
    all: ["audit"] as const,
    list: (params?: object) => ["audit", "list", params] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: (params?: object) => ["notifications", "list", params] as const,
    unreadCount: () => ["notifications", "unread-count"] as const,
    preferences: () => ["notifications", "preferences"] as const,
  },
  featureFlags: {
    all: ["feature-flags"] as const,
    list: () => ["feature-flags", "list"] as const,
    evaluate: () => ["feature-flags", "evaluate"] as const,
  },
  settings: {
    all: ["settings"] as const,
    user: () => ["settings", "user"] as const,
    system: () => ["settings", "system"] as const,
  },
  webhooks: {
    all: ["webhooks"] as const,
    list: () => ["webhooks", "list"] as const,
    deliveries: (id: string, params?: object) =>
      ["webhooks", "deliveries", id, params] as const,
  },
  uploads: {
    all: ["uploads"] as const,
    list: (params?: object) => ["uploads", "list", params] as const,
    detail: (id: string) => ["uploads", "detail", id] as const,
  },
  search: {
    results: (params: object) => ["search", params] as const,
  },
  feedback: {
    all: ["feedback"] as const,
    list: (params?: object) => ["feedback", "list", params] as const,
    detail: (id: string) => ["feedback", "detail", id] as const,
    stats: () => ["feedback", "stats"] as const,
  },
  health: {
    status: () => ["health"] as const,
    live: () => ["health", "live"] as const,
    ready: () => ["health", "ready"] as const,
  },
} as const;
