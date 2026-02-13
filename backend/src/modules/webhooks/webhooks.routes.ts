import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { authenticate } from "../../hooks/authenticate";
import {
  createWebhookSchema,
  listDeliveriesResponseSchema,
  listDeliveriesSchema,
  updateWebhookSchema,
  webhookResponseSchema,
} from "./webhooks.schemas";
import { WebhooksService } from "./webhooks.service";

export async function webhooksRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const webhooksService = new WebhooksService();

  // ---- POST /webhooks ----
  server.post(
    "/",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["Webhooks"],
        summary: "Create a webhook (secret shown only once)",
        security: [{ bearerAuth: [] }],
        body: createWebhookSchema,
        response: {
          201: webhookResponseSchema.extend({ secret: z.string() }),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "webhooks.create";

      const webhook = await webhooksService.create(
        request.user.id,
        request.body,
      );

      request.ctx.resource = { type: "webhook", id: webhook.id };

      return reply.status(201).send({
        id: webhook.id,
        url: webhook.url,
        events: webhook.events ?? [],
        active: webhook.active,
        secret: webhook.secret,
        description: webhook.description,
        createdAt: webhook.createdAt.toISOString(),
        updatedAt: webhook.updatedAt.toISOString(),
      });
    },
  );

  // ---- GET /webhooks ----
  server.get(
    "/",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["Webhooks"],
        summary: "List webhooks for the current user",
        security: [{ bearerAuth: [] }],
        response: {
          200: z.array(webhookResponseSchema),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "webhooks.list";

      const hooks = await webhooksService.listByUserId(request.user.id);

      return reply.send(
        hooks.map((w) => ({
          id: w.id,
          url: w.url,
          events: w.events ?? [],
          active: w.active,
          description: w.description,
          createdAt: w.createdAt.toISOString(),
          updatedAt: w.updatedAt.toISOString(),
        })),
      );
    },
  );

  // ---- PATCH /webhooks/:id ----
  server.patch(
    "/:id",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["Webhooks"],
        summary: "Update a webhook",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string().uuid() }),
        body: updateWebhookSchema,
        response: {
          200: webhookResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "webhooks.update";
      request.ctx.resource = { type: "webhook", id: request.params.id };

      const webhook = await webhooksService.update(
        request.params.id,
        request.user.id,
        request.body,
      );

      return reply.send({
        id: webhook.id,
        url: webhook.url,
        events: webhook.events ?? [],
        active: webhook.active,
        description: webhook.description,
        createdAt: webhook.createdAt.toISOString(),
        updatedAt: webhook.updatedAt.toISOString(),
      });
    },
  );

  // ---- DELETE /webhooks/:id ----
  server.delete(
    "/:id",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["Webhooks"],
        summary: "Delete a webhook",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: z.object({ success: z.boolean() }),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "webhooks.delete";
      request.ctx.resource = { type: "webhook", id: request.params.id };

      await webhooksService.delete(request.params.id, request.user.id);

      return reply.send({ success: true });
    },
  );

  // ---- GET /webhooks/:id/deliveries ----
  server.get(
    "/:id/deliveries",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["Webhooks"],
        summary: "List deliveries for a webhook",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string().uuid() }),
        querystring: listDeliveriesSchema,
        response: {
          200: listDeliveriesResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "webhooks.list-deliveries";
      request.ctx.resource = { type: "webhook", id: request.params.id };

      const { data, total } = await webhooksService.listDeliveries(
        request.params.id,
        request.user.id,
        { page: request.query.page, limit: request.query.limit },
      );

      return reply.send({
        data: data.map((d) => ({
          id: d.id,
          event: d.event,
          payload: d.payload,
          statusCode: d.statusCode,
          responseBody: d.responseBody,
          attempts: d.attempts,
          deliveredAt: d.deliveredAt?.toISOString() ?? null,
          failedAt: d.failedAt?.toISOString() ?? null,
          createdAt: d.createdAt.toISOString(),
        })),
        total,
        page: request.query.page,
        limit: request.query.limit,
      });
    },
  );

  // ---- POST /webhooks/:id/test ----
  server.post(
    "/:id/test",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["Webhooks"],
        summary: "Send a test event to a webhook",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: z.object({ success: z.boolean() }),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "webhooks.test";
      request.ctx.resource = { type: "webhook", id: request.params.id };

      await webhooksService.sendTestEvent(request.params.id, request.user.id);

      return reply.send({ success: true });
    },
  );
}
