import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import { ROLES } from "../../config/constants";
import { authenticate } from "../../hooks/authenticate";
import { authorize } from "../../hooks/authorize";
import {
  auditLogsListResponseSchema,
  listAuditLogsQuerySchema,
} from "./audit.schemas";
import { AuditService } from "./audit.service";

export async function auditRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const auditService = new AuditService();

  // All audit routes require admin authentication
  server.addHook("preHandler", authenticate);
  server.addHook("preHandler", authorize(ROLES.ADMIN));

  // ---- GET /audit ----
  server.get(
    "/",
    {
      schema: {
        tags: ["Audit"],
        summary: "List audit logs (admin only)",
        security: [{ bearerAuth: [] }],
        querystring: listAuditLogsQuerySchema,
        response: {
          200: auditLogsListResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "audit.list";

      const result = await auditService.list(request.query);

      request.ctx.resultCount = result.data.length;
      request.ctx.resultTotal = result.meta.total;

      return reply.send(result);
    },
  );
}
