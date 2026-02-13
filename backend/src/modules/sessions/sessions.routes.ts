import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { authenticate } from "../../hooks/authenticate";
import { listSessionsResponseSchema } from "./sessions.schemas";
import { SessionsService } from "./sessions.service";

export async function sessionsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const sessionsService = new SessionsService();

  // ---- GET /sessions ----
  server.get(
    "/",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["Sessions"],
        summary: "List active sessions for the current user",
        security: [{ bearerAuth: [] }],
        response: {
          200: listSessionsResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "sessions.list";

      const sessions = await sessionsService.listActiveSessions(
        request.user.id,
      );

      const data = sessions.map((s) => ({
        id: s.id,
        ip: s.ip,
        userAgent: s.userAgent,
        deviceName: s.deviceName,
        lastActiveAt: s.lastActiveAt?.toISOString() ?? null,
        createdAt: s.createdAt.toISOString(),
        isCurrent: s.isCurrent,
      }));

      return reply.send({
        data,
        total: data.length,
        page: 1,
        limit: data.length,
      });
    },
  );

  // ---- DELETE /sessions/:id ----
  server.delete(
    "/:id",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["Sessions"],
        summary: "Revoke a specific session",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: z.object({ success: z.boolean() }),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "sessions.revoke";
      request.ctx.resource = { type: "session", id: request.params.id };

      await sessionsService.revokeSession(request.params.id, request.user.id);

      return reply.send({ success: true });
    },
  );

  // ---- DELETE /sessions ----
  server.delete(
    "/",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["Sessions"],
        summary: "Revoke all sessions except the current one",
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({ revoked: z.number() }),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "sessions.revoke-all";

      // We don't track session ID in the JWT, so we revoke all
      // except what we can identify from the request
      const revoked = await sessionsService.revokeAllExcept(
        request.user.id,
        "", // No current session tracking in JWT
      );

      return reply.send({ revoked });
    },
  );
}
