import { sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { db } from "../../db/index";
import { container } from "../../lib/container";
import { logger } from "../../lib/logger";

const log = logger.child({ module: "health" });

// ---- Response schemas ----

const healthResponseSchema = z.object({
  status: z.enum(["ok", "degraded"]),
  timestamp: z.string(),
  uptime: z.number(),
  database: z.enum(["connected", "disconnected"]),
});

const readinessResponseSchema = z.object({
  status: z.enum(["ready", "not_ready"]),
  timestamp: z.string(),
  checks: z.object({
    database: z.object({
      status: z.enum(["ok", "fail"]),
      latencyMs: z.number().optional(),
    }),
    mail: z.object({
      status: z.enum(["ok", "fail", "unconfigured"]),
    }),
    storage: z.object({
      status: z.enum(["ok", "fail", "unconfigured"]),
    }),
  }),
});

const livenessResponseSchema = z.object({
  status: z.literal("alive"),
  timestamp: z.string(),
  uptime: z.number(),
  memory: z.object({
    rss: z.number(),
    heapUsed: z.number(),
    heapTotal: z.number(),
  }),
});

export async function healthRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // ---- GET /health ----
  server.get(
    "/",
    {
      schema: {
        tags: ["Health"],
        summary: "Health check",
        response: {
          200: healthResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "health.check";

      let dbStatus: "connected" | "disconnected" = "disconnected";

      try {
        await db.execute(sql`SELECT 1`);
        dbStatus = "connected";
      } catch (err) {
        dbStatus = "disconnected";
        log.warn(err, "Health check: database connectivity failed");
      }

      const status = dbStatus === "connected" ? "ok" : "degraded";

      request.ctx.healthStatus = status;
      request.ctx.dbStatus = dbStatus;

      return reply.send({
        status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbStatus,
      });
    },
  );

  // ---- GET /health/live ----
  server.get(
    "/live",
    {
      schema: {
        tags: ["Health"],
        summary: "Liveness probe — is the process alive?",
        response: {
          200: livenessResponseSchema,
        },
      },
    },
    async (_request, reply) => {
      const mem = process.memoryUsage();

      return reply.send({
        status: "alive" as const,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          rss: mem.rss,
          heapUsed: mem.heapUsed,
          heapTotal: mem.heapTotal,
        },
      });
    },
  );

  // ---- GET /health/ready ----
  server.get(
    "/ready",
    {
      schema: {
        tags: ["Health"],
        summary: "Readiness probe — are all dependencies available?",
        response: {
          200: readinessResponseSchema,
          503: readinessResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "health.readiness";

      // Check database
      let dbOk = false;
      let dbLatency: number | undefined;
      try {
        const start = Date.now();
        await db.execute(sql`SELECT 1`);
        dbLatency = Date.now() - start;
        dbOk = true;
      } catch (err) {
        log.warn(err, "Readiness: database check failed");
      }

      // Check mail provider
      let mailStatus: "ok" | "fail" | "unconfigured" = "unconfigured";
      if (container.has("mail")) {
        try {
          const mail = container.resolve("mail");
          const ok = await mail.verify();
          mailStatus = ok ? "ok" : "fail";
        } catch {
          mailStatus = "fail";
        }
      }

      // Check storage provider
      let storageStatus: "ok" | "fail" | "unconfigured" = "unconfigured";
      if (container.has("storage")) {
        try {
          const storage = container.resolve("storage");
          const ok = await storage.verify();
          storageStatus = ok ? "ok" : "fail";
        } catch {
          storageStatus = "fail";
        }
      }

      const isReady = dbOk;
      const status = isReady ? ("ready" as const) : ("not_ready" as const);

      const body = {
        status,
        timestamp: new Date().toISOString(),
        checks: {
          database: {
            status: (dbOk ? "ok" : "fail") as "ok" | "fail",
            ...(dbLatency !== undefined ? { latencyMs: dbLatency } : {}),
          },
          mail: { status: mailStatus },
          storage: { status: storageStatus },
        },
      };

      return reply.status(isReady ? 200 : 503).send(body);
    },
  );
}
