import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { ROLES } from "../../config/constants";
import { env } from "../../config/env";
import { authenticate } from "../../hooks/authenticate";
import { authorize } from "../../hooks/authorize";
import {
  createFeatureFlagSchema,
  evaluateFlagsResponseSchema,
  featureFlagResponseSchema,
  updateFeatureFlagSchema,
} from "./feature-flags.schemas";
import { FeatureFlagsService } from "./feature-flags.service";

export async function featureFlagsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const featureFlagsService = new FeatureFlagsService();

  // ---- GET /feature-flags ----
  server.get(
    "/",
    {
      preHandler: [authenticate, authorize(ROLES.ADMIN)],
      schema: {
        tags: ["Feature Flags"],
        summary: "List all feature flags (admin)",
        security: [{ bearerAuth: [] }],
        response: {
          200: z.array(featureFlagResponseSchema),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "feature-flags.list";

      const flags = await featureFlagsService.listAll();

      return reply.send(
        flags.map((f) => ({
          id: f.id,
          key: f.key,
          description: f.description,
          enabled: f.enabled,
          conditions: f.conditions ?? null,
          createdAt: f.createdAt.toISOString(),
          updatedAt: f.updatedAt.toISOString(),
        })),
      );
    },
  );

  // ---- POST /feature-flags ----
  server.post(
    "/",
    {
      preHandler: [authenticate, authorize(ROLES.ADMIN)],
      schema: {
        tags: ["Feature Flags"],
        summary: "Create a feature flag",
        security: [{ bearerAuth: [] }],
        body: createFeatureFlagSchema,
        response: {
          201: featureFlagResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "feature-flags.create";

      const flag = await featureFlagsService.create(request.body);
      request.ctx.resource = { type: "feature-flag", id: flag.id };

      return reply.status(201).send({
        id: flag.id,
        key: flag.key,
        description: flag.description,
        enabled: flag.enabled,
        conditions: flag.conditions ?? null,
        createdAt: flag.createdAt.toISOString(),
        updatedAt: flag.updatedAt.toISOString(),
      });
    },
  );

  // ---- PATCH /feature-flags/:id ----
  server.patch(
    "/:id",
    {
      preHandler: [authenticate, authorize(ROLES.ADMIN)],
      schema: {
        tags: ["Feature Flags"],
        summary: "Update a feature flag",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string().uuid() }),
        body: updateFeatureFlagSchema,
        response: {
          200: featureFlagResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "feature-flags.update";
      request.ctx.resource = { type: "feature-flag", id: request.params.id };

      const flag = await featureFlagsService.update(
        request.params.id,
        request.body,
      );

      return reply.send({
        id: flag.id,
        key: flag.key,
        description: flag.description,
        enabled: flag.enabled,
        conditions: flag.conditions ?? null,
        createdAt: flag.createdAt.toISOString(),
        updatedAt: flag.updatedAt.toISOString(),
      });
    },
  );

  // ---- DELETE /feature-flags/:id ----
  server.delete(
    "/:id",
    {
      preHandler: [authenticate, authorize(ROLES.ADMIN)],
      schema: {
        tags: ["Feature Flags"],
        summary: "Delete a feature flag",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: z.object({ success: z.boolean() }),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "feature-flags.delete";
      request.ctx.resource = { type: "feature-flag", id: request.params.id };

      await featureFlagsService.delete(request.params.id);

      return reply.send({ success: true });
    },
  );

  // ---- GET /feature-flags/evaluate ----
  server.get(
    "/evaluate",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["Feature Flags"],
        summary: "Evaluate all flags for the current user",
        security: [{ bearerAuth: [] }],
        response: {
          200: evaluateFlagsResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "feature-flags.evaluate";

      const result = await featureFlagsService.evaluateAll({
        userId: request.user.id,
        role: request.user.role,
        environment: env.NODE_ENV,
      });

      return reply.send(result);
    },
  );
}
