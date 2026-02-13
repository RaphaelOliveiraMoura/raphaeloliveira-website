import type {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fp from "fastify-plugin";
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";
import { ZodError } from "zod";

import { env } from "../config/env";
import { AppError } from "../lib/errors";
import type { ApiErrorResponse } from "../types/index";

/**
 * Enrich the wide event context with error info so the canonical log line
 * (emitted by the request-context plugin onResponse hook) includes it.
 */
function enrichCtx(
  request: FastifyRequest,
  code: string,
  message: string,
  type: string,
) {
  if (request.ctx) {
    request.ctx.outcome = "error";
    request.ctx.error = { code, message, type };
  }
}

/**
 * Global error handler.
 *
 * Normalizes all errors into the standard ApiErrorResponse shape
 * and enriches request.ctx for structured logging.
 */
function errorHandler(
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Application errors (thrown intentionally)
  if (error instanceof AppError) {
    enrichCtx(request, error.code, error.message, error.name);

    const response: ApiErrorResponse = {
      code: error.code,
      message: error.message,
      status: error.statusCode,
      ...(error.details && { details: error.details }),
    };
    return reply.status(error.statusCode).send(response);
  }

  // Zod validation errors from fastify-type-provider-zod
  if (hasZodFastifySchemaValidationErrors(error)) {
    enrichCtx(
      request,
      "VALIDATION_ERROR",
      "Validation failed",
      "ZodValidationError",
    );

    const response: ApiErrorResponse = {
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      status: 400,
      details: {
        issues: (error as FastifyError & { validation?: unknown }).validation,
      },
    };
    return reply.status(400).send(response);
  }

  // Raw Zod errors (e.g. from manual parsing)
  if (error instanceof ZodError) {
    enrichCtx(request, "VALIDATION_ERROR", "Validation failed", "ZodError");

    const response: ApiErrorResponse = {
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      status: 400,
      details: {
        issues: error.issues,
      },
    };
    return reply.status(400).send(response);
  }

  // Fastify errors with status code (e.g. 400, 404, 429)
  const fastifyError = error as FastifyError;
  if (fastifyError.statusCode && fastifyError.statusCode < 500) {
    enrichCtx(
      request,
      fastifyError.code ?? "BAD_REQUEST",
      fastifyError.message,
      "FastifyError",
    );

    const response: ApiErrorResponse = {
      code: fastifyError.code ?? "BAD_REQUEST",
      message: fastifyError.message,
      status: fastifyError.statusCode,
    };
    return reply.status(fastifyError.statusCode).send(response);
  }

  // Unexpected / unhandled errors (500)
  const message =
    error instanceof Error ? error.message : "Internal server error";
  enrichCtx(
    request,
    "INTERNAL_ERROR",
    message,
    error?.constructor?.name ?? "Error",
  );

  // Attach stack for 500s so the canonical log line has it (non-production only)
  if (request.ctx) {
    request.ctx.errorStack =
      env.NODE_ENV !== "production" && error instanceof Error
        ? error.stack
        : undefined;
  }

  const response: ApiErrorResponse = {
    code: "INTERNAL_ERROR",
    message: env.NODE_ENV === "production" ? "Internal server error" : message,
    status: 500,
  };
  return reply.status(500).send(response);
}

export default fp(
  async (app: FastifyInstance) => {
    app.setErrorHandler(errorHandler);
  },
  { name: "error-handler" },
);
