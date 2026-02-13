import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { authenticate } from "../../hooks/authenticate";
import {
  listNotificationsResponseSchema,
  listNotificationsSchema,
  preferenceResponseSchema,
  unreadCountResponseSchema,
  updatePreferencesSchema,
} from "./notifications.schemas";
import { NotificationsService } from "./notifications.service";

export async function notificationsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const notificationsService = new NotificationsService();

  // ---- GET /notifications ----
  server.get(
    "/",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["Notifications"],
        summary: "List notifications for the current user",
        security: [{ bearerAuth: [] }],
        querystring: listNotificationsSchema,
        response: {
          200: listNotificationsResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "notifications.list";

      const { data, total } = await notificationsService.listByUserId(
        request.user.id,
        {
          page: request.query.page,
          limit: request.query.limit,
          status: request.query.status,
        },
      );

      return reply.send({
        data: data.map((n) => ({
          id: n.id,
          type: n.type,
          channel: n.channel,
          title: n.title,
          body: n.body,
          data: n.data,
          readAt: n.readAt?.toISOString() ?? null,
          createdAt: n.createdAt.toISOString(),
        })),
        total,
        page: request.query.page,
        limit: request.query.limit,
      });
    },
  );

  // ---- GET /notifications/unread-count ----
  server.get(
    "/unread-count",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["Notifications"],
        summary: "Get unread notification count",
        security: [{ bearerAuth: [] }],
        response: {
          200: unreadCountResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "notifications.unread-count";

      const count = await notificationsService.unreadCount(request.user.id);

      return reply.send({ count });
    },
  );

  // ---- PATCH /notifications/:id/read ----
  server.patch(
    "/:id/read",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["Notifications"],
        summary: "Mark a notification as read",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: z.object({ success: z.boolean() }),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "notifications.mark-read";
      request.ctx.resource = { type: "notification", id: request.params.id };

      await notificationsService.markAsRead(request.params.id, request.user.id);

      return reply.send({ success: true });
    },
  );

  // ---- POST /notifications/read-all ----
  server.post(
    "/read-all",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["Notifications"],
        summary: "Mark all notifications as read",
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({ marked: z.number() }),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "notifications.mark-all-read";

      const marked = await notificationsService.markAllAsRead(request.user.id);

      return reply.send({ marked });
    },
  );

  // ---- DELETE /notifications/:id ----
  server.delete(
    "/:id",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["Notifications"],
        summary: "Delete a notification",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: z.object({ success: z.boolean() }),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "notifications.delete";
      request.ctx.resource = { type: "notification", id: request.params.id };

      await notificationsService.deleteNotification(
        request.params.id,
        request.user.id,
      );

      return reply.send({ success: true });
    },
  );

  // ---- GET /notifications/preferences ----
  server.get(
    "/preferences",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["Notifications"],
        summary: "Get notification preferences",
        security: [{ bearerAuth: [] }],
        response: {
          200: z.array(preferenceResponseSchema),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "notifications.get-preferences";

      const prefs = await notificationsService.getPreferences(request.user.id);

      return reply.send(
        prefs.map((p) => ({
          channel: p.channel,
          inApp: p.inApp,
          email: p.email,
        })),
      );
    },
  );

  // ---- PUT /notifications/preferences ----
  server.put(
    "/preferences",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["Notifications"],
        summary: "Update notification preferences",
        security: [{ bearerAuth: [] }],
        body: updatePreferencesSchema,
        response: {
          200: z.array(preferenceResponseSchema),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "notifications.update-preferences";

      const prefs = await notificationsService.updatePreferences(
        request.user.id,
        request.body,
      );

      return reply.send(
        prefs.map((p) => ({
          channel: p.channel,
          inApp: p.inApp,
          email: p.email,
        })),
      );
    },
  );
}
