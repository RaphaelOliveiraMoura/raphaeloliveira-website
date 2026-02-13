import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

import { logger } from "../lib/logger";

/**
 * Request context for Wide Events / Canonical Log Lines.
 *
 * Each request accumulates context throughout its lifecycle. A single
 * structured log line is emitted in the `onResponse` hook with all
 * the context gathered during the request.
 *
 * Handlers and hooks enrich `request.ctx` with domain-specific fields.
 */
export interface RequestContext {
  // ---- Populated automatically by plugin (onRequest) ----
  requestId: string;
  method: string;
  path: string;
  url: string;
  ip: string;
  userAgent: string;
  startTime: number;

  // ---- Populated by auth hooks ----
  userId?: string;
  userEmail?: string;
  userRole?: string;

  // ---- Populated by route handlers ----
  action?: string;
  resource?: {
    type: string;
    id?: string;
  };
  outcome?: "success" | "error";

  // ---- Populated by error handler ----
  error?: {
    code: string;
    message: string;
    type: string;
    retriable?: boolean;
  };

  // ---- Free-form fields for extra context ----
  [key: string]: unknown;
}

/**
 * Determine log level based on status code.
 *
 * - 5xx -> error
 * - 401, 403 -> warn (security events)
 * - 400, 404, 409, 429 -> warn
 * - 2xx, 3xx -> info
 */
function levelFromStatus(statusCode: number): "error" | "warn" | "info" {
  if (statusCode >= 500) return "error";
  if (statusCode >= 400) return "warn";
  return "info";
}

export default fp(
  async (app: FastifyInstance) => {
    // Decorate request with a placeholder ctx object.
    // The actual value is set in the onRequest hook below.
    app.decorateRequest("ctx", undefined as unknown as RequestContext);

    // ---- onRequest: initialize the wide event context ----
    app.addHook(
      "onRequest",
      async (request: FastifyRequest, _reply: FastifyReply) => {
        request.ctx = {
          requestId: request.id,
          method: request.method,
          path: request.routeOptions?.url ?? request.url,
          url: request.url,
          ip: request.ip,
          userAgent: request.headers["user-agent"] ?? "",
          startTime: Date.now(),
        };
      },
    );

    // ---- onResponse: emit the canonical log line ----
    app.addHook(
      "onResponse",
      async (request: FastifyRequest, reply: FastifyReply) => {
        const ctx = request.ctx;
        if (!ctx) return;

        const statusCode = reply.statusCode;
        const durationMs = Date.now() - ctx.startTime;

        // Build the canonical wide event object
        const { startTime: _, ...restCtx } = ctx;
        const wideEvent = {
          ...restCtx,
          statusCode,
          durationMs,
          outcome: ctx.outcome ?? (statusCode < 400 ? "success" : "error"),
        };

        const level = levelFromStatus(statusCode);
        logger[level](wideEvent, "request completed");
      },
    );
  },
  { name: "request-context" },
);
