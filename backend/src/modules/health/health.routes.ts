import { sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { db } from "../../db/index";
import { logger } from "../../lib/logger";

const log = logger.child({ module: "health" });

const healthResponseSchema = z.object({
  status: z.enum(["ok", "degraded"]),
  timestamp: z.string(),
  uptime: z.number(),
  database: z.enum(["connected", "disconnected"]),
});

export async function healthRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

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
}
