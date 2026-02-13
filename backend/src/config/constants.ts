/**
 * Application-wide constants.
 */

/** Default pagination settings */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/** User roles */
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Error codes returned in API responses */
export const ERROR_CODES = {
  // Auth
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  TOKEN_INVALID: "TOKEN_INVALID",
  REFRESH_TOKEN_INVALID: "REFRESH_TOKEN_INVALID",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",

  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",

  // Resources
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",

  // Server
  INTERNAL_ERROR: "INTERNAL_ERROR",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
