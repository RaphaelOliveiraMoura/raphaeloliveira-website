import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { ROLES } from "../../config/constants";
import { authenticate } from "../../hooks/authenticate";
import { authorize } from "../../hooks/authorize";
import { sendExport } from "../../lib/export";
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

  // ---- GET /audit/export ----
  server.get(
    "/export",
    {
      schema: {
        tags: ["Audit"],
        summary: "Export audit logs as CSV or JSON (admin only)",
        security: [{ bearerAuth: [] }],
        querystring: z.object({
          format: z.enum(["csv", "json"]).default("csv"),
        }),
      },
    },
    async (request, reply) => {
      request.ctx.action = "audit.export";

      const result = await auditService.list({
        page: 1,
        limit: 10000,
      });

      await sendExport(reply, result.data, {
        format: request.query.format,
        filename: "audit-logs",
        columns: [
          { key: "id", header: "ID" },
          { key: "action", header: "Action" },
          { key: "actorId", header: "Actor ID" },
          { key: "actorEmail", header: "Actor Email" },
          { key: "resourceType", header: "Resource Type" },
          { key: "resourceId", header: "Resource ID" },
          { key: "ip", header: "IP Address" },
          { key: "createdAt", header: "Created At" },
        ],
      });
    },
  );
}
