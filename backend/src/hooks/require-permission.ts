import type { FastifyReply, FastifyRequest } from "fastify";

import { ForbiddenError } from "../lib/errors";
import { RolesService } from "../modules/roles/roles.service";

const rolesService = new RolesService();

/**
 * Factory that returns a pre-handler hook checking the user's permissions.
 * Must be used AFTER the `authenticate` hook.
 *
 * Resolves permission keys from the user's role (cached) and verifies
 * that ALL required permissions are present.
 *
 * @example
 * { preHandler: [authenticate, requirePermission("users.create")] }
 * { preHandler: [authenticate, requirePermission("users.read", "users.update")] }
 */
export function requirePermission(...requiredPermissions: string[]) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const userRole = request.user?.role;

    if (!userRole) {
      throw new ForbiddenError("No role assigned");
    }

    const userPermissions = await rolesService.getPermissionKeys(userRole);

    const hasAll = requiredPermissions.every((p) =>
      userPermissions.includes(p),
    );

    if (!hasAll) {
      // Enrich wide event context
      if (request.ctx) {
        request.ctx.authzDenied = true;
        request.ctx.authzRequiredRoles = requiredPermissions;
        request.ctx.authzUserRole = userRole;
      }

      throw new ForbiddenError("Insufficient permissions");
    }
  };
}
