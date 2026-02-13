import type { ErrorCode } from "../config/constants";
import { ERROR_CODES } from "../config/constants";

/**
 * Base application error. All custom errors extend this.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Maintain proper stack trace in V8
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string | number) {
    const message = id
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`;
    super(message, 404, ERROR_CODES.NOT_FOUND, { resource, id });
  }
}

export class ValidationError extends AppError {
  constructor(details: Record<string, unknown>) {
    super("Validation failed", 400, ERROR_CODES.VALIDATION_ERROR, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, ERROR_CODES.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, ERROR_CODES.FORBIDDEN);
  }
}

export class ConflictError extends AppError {
  constructor(resource: string, field: string) {
    super(
      `${resource} with this ${field} already exists`,
      409,
      ERROR_CODES.CONFLICT,
      { resource, field },
    );
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super(
      "Too many requests, please try again later",
      429,
      ERROR_CODES.RATE_LIMIT_EXCEEDED,
    );
  }
}
