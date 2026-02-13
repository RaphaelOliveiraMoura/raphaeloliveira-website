import type { FastifyReply, FastifyRequest } from "fastify";

import type { Role } from "../config/constants";
import { ForbiddenError } from "../lib/errors";

/**
 * Factory that returns a pre-handler hook checking the user's role.
 * Must be used AFTER the `authenticate` hook.
 *
 * On failure, enriches `request.ctx` with authorization details
 * for the canonical log line.
 *
 * @example
 * { preHandler: [authenticate, authorize("admin")] }
 */
export function authorize(...allowedRoles: Role[]) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const userRole = request.user?.role;

    if (!userRole || !allowedRoles.includes(userRole as Role)) {
      // Enrich wide event context with authorization failure details
      if (request.ctx) {
        request.ctx.authzDenied = true;
        request.ctx.authzRequiredRoles = allowedRoles;
        request.ctx.authzUserRole = userRole;
      }

      throw new ForbiddenError(
        "You do not have permission to access this resource",
      );
    }
  };
}
