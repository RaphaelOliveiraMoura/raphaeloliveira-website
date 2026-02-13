import pino from "pino";

import { env } from "../config/env";

/**
 * Centralized Pino logger instance.
 *
 * - **Production:** JSON output (ideal for log aggregation / observability tools)
 * - **Development:** pino-pretty for human-readable output
 *
 * Every log line includes `service` and `env` base fields.
 * Use `logger.child({ module: "..." })` for non-request logging (startup, seed, etc.).
 * Inside requests, the canonical log line is emitted by the request-context plugin.
 */
export const logger = pino({
  level: env.LOG_LEVEL,

  // Human-readable output in development
  ...(env.NODE_ENV === "development" && {
    transport: {
      target: "pino-pretty",
      options: { colorize: true },
    },
  }),

  // Base fields attached to every log line
  base: {
    service: "core-stack-api",
    env: env.NODE_ENV,
  },

  // ISO 8601 timestamps for cross-tool compatibility
  timestamp: pino.stdTimeFunctions.isoTime,
});

export type Logger = pino.Logger;
