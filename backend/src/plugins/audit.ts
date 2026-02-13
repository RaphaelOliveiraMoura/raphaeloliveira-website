import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

import { AuditService } from "../modules/audit/audit.service";

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Automatic audit logging plugin.
 *
 * Hooks into `onResponse` to log mutation requests (POST, PUT, PATCH, DELETE)
 * that completed successfully (2xx/3xx status codes).
 *
 * The audit log is populated from `request.ctx` fields set by route handlers:
 * - `request.ctx.action` — action name (e.g. "user.create")
 * - `request.ctx.resource` — { type, id }
 * - `request.ctx.fieldsChanged` — array of changed field names
 */
export default fp(
  async (app: FastifyInstance) => {
    const auditService = new AuditService();

    app.addHook(
      "onResponse",
      async (request: FastifyRequest, reply: FastifyReply) => {
        const ctx = request.ctx;
        if (!ctx) return;

        // Only log mutations that succeeded
        if (!MUTATION_METHODS.has(request.method)) return;
        if (reply.statusCode >= 400) return;
        if (!ctx.action) return;

        try {
          await auditService.log({
            action: ctx.action,
            actorId: ctx.userId,
            actorEmail: ctx.userEmail,
            resourceType: ctx.resource?.type,
            resourceId: ctx.resource?.id,
            changes: ctx.fieldsChanged
              ? { fields: ctx.fieldsChanged }
              : undefined,
            ip: ctx.ip,
            userAgent: ctx.userAgent,
          });
        } catch {
          // Audit logging should never break the request flow
        }
      },
    );
  },
  {
    name: "audit",
    dependencies: ["request-context"],
  },
);
