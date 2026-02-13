import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { ROLES } from "../../config/constants";
import { authenticate } from "../../hooks/authenticate";
import { authorize } from "../../hooks/authorize";
import { sendExport } from "../../lib/export";
import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserSchema,
  userParamsSchema,
  userResponseSchema,
  usersListResponseSchema,
} from "./users.schemas";
import { UsersService } from "./users.service";

export async function usersRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const usersService = new UsersService();

  // All users routes require authentication
  server.addHook("preHandler", authenticate);

  // ---- GET /users ----
  server.get(
    "/",
    {
      schema: {
        tags: ["Users"],
        summary: "List users (paginated)",
        security: [{ bearerAuth: [] }],
        querystring: listUsersQuerySchema,
        response: {
          200: usersListResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "user.list";

      const result = await usersService.list(request.query);

      request.ctx.resultCount = result.data.length;
      request.ctx.resultTotal = result.meta.total;

      return reply.send(result);
    },
  );

  // ---- GET /users/:id ----
  server.get(
    "/:id",
    {
      schema: {
        tags: ["Users"],
        summary: "Get a user by ID",
        security: [{ bearerAuth: [] }],
        params: userParamsSchema,
        response: {
          200: userResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "user.get";
      request.ctx.resource = { type: "user", id: request.params.id };

      const user = await usersService.getById(request.params.id);
      return reply.send(user);
    },
  );

  // ---- POST /users ----
  server.post(
    "/",
    {
      preHandler: [authorize(ROLES.ADMIN)],
      schema: {
        tags: ["Users"],
        summary: "Create a new user (admin only)",
        security: [{ bearerAuth: [] }],
        body: createUserSchema,
        response: {
          201: userResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "user.create";

      const user = await usersService.create(request.body);

      request.ctx.resource = { type: "user", id: user.id };

      return reply.status(201).send(user);
    },
  );

  // ---- PATCH /users/:id ----
  server.patch(
    "/:id",
    {
      preHandler: [authorize(ROLES.ADMIN)],
      schema: {
        tags: ["Users"],
        summary: "Update a user (admin only)",
        security: [{ bearerAuth: [] }],
        params: userParamsSchema,
        body: updateUserSchema,
        response: {
          200: userResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "user.update";
      request.ctx.resource = { type: "user", id: request.params.id };
      request.ctx.fieldsChanged = Object.keys(request.body);

      const user = await usersService.update(request.params.id, request.body);
      return reply.send(user);
    },
  );

  // ---- GET /users/export ----
  server.get(
    "/export",
    {
      preHandler: [authorize(ROLES.ADMIN)],
      schema: {
        tags: ["Users"],
        summary: "Export users as CSV or JSON (admin only)",
        security: [{ bearerAuth: [] }],
        querystring: z.object({
          format: z.enum(["csv", "json"]).default("csv"),
        }),
      },
    },
    async (request, reply) => {
      request.ctx.action = "user.export";

      // Fetch all users (no pagination)
      const result = await usersService.list({
        page: 1,
        limit: 10000,
      });

      await sendExport(reply, result.data, {
        format: request.query.format,
        filename: "users",
        columns: [
          { key: "id", header: "ID" },
          { key: "name", header: "Name" },
          { key: "email", header: "Email" },
          { key: "role", header: "Role" },
          { key: "createdAt", header: "Created At" },
          { key: "updatedAt", header: "Updated At" },
        ],
      });
    },
  );

  // ---- DELETE /users/:id ----
  server.delete(
    "/:id",
    {
      preHandler: [authorize(ROLES.ADMIN)],
      schema: {
        tags: ["Users"],
        summary: "Delete a user (admin only)",
        security: [{ bearerAuth: [] }],
        params: userParamsSchema,
        response: {
          200: z.object({ success: z.boolean() }),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "user.delete";
      request.ctx.resource = { type: "user", id: request.params.id };

      await usersService.delete(request.params.id);
      return reply.send({ success: true });
    },
  );
}
