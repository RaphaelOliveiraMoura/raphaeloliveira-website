import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { authenticate } from "../../hooks/authenticate";
import {
  createApiKeyResponseSchema,
  createApiKeySchema,
  listApiKeysResponseSchema,
} from "./api-keys.schemas";
import { ApiKeysService } from "./api-keys.service";

export async function apiKeysRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const apiKeysService = new ApiKeysService();

  // ---- POST /api-keys ----
  server.post(
    "/",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["API Keys"],
        summary: "Create a new API key (key shown only once)",
        security: [{ bearerAuth: [] }],
        body: createApiKeySchema,
        response: {
          201: createApiKeyResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "api-key.create";

      const { key, apiKey } = await apiKeysService.create(
        request.user.id,
        request.body,
      );

      request.ctx.resource = { type: "api-key", id: apiKey.id };

      return reply.status(201).send({
        id: apiKey.id,
        name: apiKey.name,
        prefix: apiKey.prefix,
        key,
        scopes: apiKey.scopes ?? [],
        expiresAt: apiKey.expiresAt?.toISOString() ?? null,
        lastUsedAt: apiKey.lastUsedAt?.toISOString() ?? null,
        createdAt: apiKey.createdAt.toISOString(),
      });
    },
  );

  // ---- GET /api-keys ----
  server.get(
    "/",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["API Keys"],
        summary: "List API keys for the current user",
        security: [{ bearerAuth: [] }],
        response: {
          200: listApiKeysResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "api-key.list";

      const keys = await apiKeysService.listByUserId(request.user.id);

      return reply.send({
        data: keys.map((k) => ({
          id: k.id,
          name: k.name,
          prefix: k.prefix,
          scopes: k.scopes ?? [],
          expiresAt: k.expiresAt?.toISOString() ?? null,
          lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
          createdAt: k.createdAt.toISOString(),
        })),
        total: keys.length,
      });
    },
  );

  // ---- DELETE /api-keys/:id ----
  server.delete(
    "/:id",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["API Keys"],
        summary: "Revoke an API key",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: z.object({ success: z.boolean() }),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "api-key.revoke";
      request.ctx.resource = { type: "api-key", id: request.params.id };

      await apiKeysService.revoke(request.params.id, request.user.id);

      return reply.send({ success: true });
    },
  );
}
