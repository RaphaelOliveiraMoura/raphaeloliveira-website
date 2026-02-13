import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { ROLES } from "../../config/constants";
import { authenticate } from "../../hooks/authenticate";
import { authorize } from "../../hooks/authorize";
import {
  createRoleSchema,
  permissionResponseSchema,
  roleResponseSchema,
  setPermissionsSchema,
  updateRoleSchema,
} from "./roles.schemas";
import { RolesService } from "./roles.service";

export async function rolesRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const rolesService = new RolesService();

  // ---- GET /roles ----
  server.get(
    "/",
    {
      preHandler: [authenticate, authorize(ROLES.ADMIN)],
      schema: {
        tags: ["Roles"],
        summary: "List all roles with their permissions",
        security: [{ bearerAuth: [] }],
        response: {
          200: z.array(roleResponseSchema),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "roles.list";

      const roles = await rolesService.listRoles();

      return reply.send(
        roles.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          isSystem: r.isSystem,
          permissions: r.permissions.map((p) => ({
            id: p.id,
            key: p.key,
            description: p.description,
            resource: p.resource,
            action: p.action,
          })),
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        })),
      );
    },
  );

  // ---- POST /roles ----
  server.post(
    "/",
    {
      preHandler: [authenticate, authorize(ROLES.ADMIN)],
      schema: {
        tags: ["Roles"],
        summary: "Create a custom role",
        security: [{ bearerAuth: [] }],
        body: createRoleSchema,
        response: {
          201: roleResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "roles.create";

      const role = await rolesService.createRole(request.body);
      request.ctx.resource = { type: "role", id: role.id };

      return reply.status(201).send({
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        permissions: [],
        createdAt: role.createdAt.toISOString(),
        updatedAt: role.updatedAt.toISOString(),
      });
    },
  );

  // ---- PATCH /roles/:id ----
  server.patch(
    "/:id",
    {
      preHandler: [authenticate, authorize(ROLES.ADMIN)],
      schema: {
        tags: ["Roles"],
        summary: "Update a role",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string().uuid() }),
        body: updateRoleSchema,
        response: {
          200: roleResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "roles.update";
      request.ctx.resource = { type: "role", id: request.params.id };

      const role = await rolesService.updateRole(
        request.params.id,
        request.body,
      );

      return reply.send({
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        permissions: role.permissions.map((p) => ({
          id: p.id,
          key: p.key,
          description: p.description,
          resource: p.resource,
          action: p.action,
        })),
        createdAt: role.createdAt.toISOString(),
        updatedAt: role.updatedAt.toISOString(),
      });
    },
  );

  // ---- DELETE /roles/:id ----
  server.delete(
    "/:id",
    {
      preHandler: [authenticate, authorize(ROLES.ADMIN)],
      schema: {
        tags: ["Roles"],
        summary: "Delete a role (system roles cannot be deleted)",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: z.object({ success: z.boolean() }),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "roles.delete";
      request.ctx.resource = { type: "role", id: request.params.id };

      await rolesService.deleteRole(request.params.id);

      return reply.send({ success: true });
    },
  );

  // ---- PUT /roles/:id/permissions ----
  server.put(
    "/:id/permissions",
    {
      preHandler: [authenticate, authorize(ROLES.ADMIN)],
      schema: {
        tags: ["Roles"],
        summary: "Set permissions for a role",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string().uuid() }),
        body: setPermissionsSchema,
        response: {
          200: roleResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "roles.set-permissions";
      request.ctx.resource = { type: "role", id: request.params.id };

      const role = await rolesService.setPermissions(
        request.params.id,
        request.body.permissionIds,
      );

      return reply.send({
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        permissions: role.permissions.map((p) => ({
          id: p.id,
          key: p.key,
          description: p.description,
          resource: p.resource,
          action: p.action,
        })),
        createdAt: role.createdAt.toISOString(),
        updatedAt: role.updatedAt.toISOString(),
      });
    },
  );

  // ---- GET /permissions ----
  server.get(
    "/permissions",
    {
      preHandler: [authenticate, authorize(ROLES.ADMIN)],
      schema: {
        tags: ["Roles"],
        summary: "List all available permissions",
        security: [{ bearerAuth: [] }],
        response: {
          200: z.array(permissionResponseSchema),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "permissions.list";

      const perms = await rolesService.listPermissions();

      return reply.send(
        perms.map((p) => ({
          id: p.id,
          key: p.key,
          description: p.description,
          resource: p.resource,
          action: p.action,
        })),
      );
    },
  );
}
