import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { ROLES } from "../../config/constants";
import { authenticate } from "../../hooks/authenticate";
import { authorize } from "../../hooks/authorize";
import {
  createFeedbackSchema,
  createResponseSchema,
  feedbackDetailResponseSchema,
  feedbackListResponseSchema,
  feedbackParamsSchema,
  feedbackResponseItemSchema,
  feedbackResponseSchema,
  feedbackStatsResponseSchema,
  listFeedbackQuerySchema,
  updateFeedbackSchema,
} from "./feedback.schemas";
import { FeedbackService } from "./feedback.service";

export async function feedbackRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const feedbackService = new FeedbackService();

  // All feedback routes require authentication
  server.addHook("preHandler", authenticate);

  // ---- GET /feedback/stats ---- (must be before /:id)
  server.get(
    "/stats",
    {
      preHandler: [authorize(ROLES.ADMIN)],
      schema: {
        tags: ["Feedback"],
        summary: "Get feedback statistics (admin only)",
        security: [{ bearerAuth: [] }],
        response: {
          200: feedbackStatsResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "feedback.stats";

      const stats = await feedbackService.getStats();
      return reply.send(stats);
    },
  );

  // ---- POST /feedback ----
  server.post(
    "/",
    {
      schema: {
        tags: ["Feedback"],
        summary: "Create a new feedback",
        security: [{ bearerAuth: [] }],
        body: createFeedbackSchema,
        response: {
          201: feedbackResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "feedback.create";

      const feedback = await feedbackService.create(
        request.body,
        request.user.id,
      );

      request.ctx.resource = { type: "feedback", id: feedback.id };

      return reply.status(201).send(feedback);
    },
  );

  // ---- GET /feedback ----
  server.get(
    "/",
    {
      schema: {
        tags: ["Feedback"],
        summary: "List feedbacks (users see own, admins see all)",
        security: [{ bearerAuth: [] }],
        querystring: listFeedbackQuerySchema,
        response: {
          200: feedbackListResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "feedback.list";

      const isAdmin = request.user.role === ROLES.ADMIN;
      const result = await feedbackService.list(
        request.query,
        request.user.id,
        isAdmin,
      );

      request.ctx.resultCount = result.data.length;
      request.ctx.resultTotal = result.meta.total;

      return reply.send(result);
    },
  );

  // ---- GET /feedback/:id ----
  server.get(
    "/:id",
    {
      schema: {
        tags: ["Feedback"],
        summary: "Get feedback detail with responses and votes",
        security: [{ bearerAuth: [] }],
        params: feedbackParamsSchema,
        response: {
          200: feedbackDetailResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "feedback.get";
      request.ctx.resource = { type: "feedback", id: request.params.id };

      const isAdmin = request.user.role === ROLES.ADMIN;
      const feedback = await feedbackService.getById(
        request.params.id,
        request.user.id,
        isAdmin,
      );

      return reply.send(feedback);
    },
  );

  // ---- PATCH /feedback/:id ----
  server.patch(
    "/:id",
    {
      schema: {
        tags: ["Feedback"],
        summary: "Update feedback (user: title/description; admin: all fields)",
        security: [{ bearerAuth: [] }],
        params: feedbackParamsSchema,
        body: updateFeedbackSchema,
        response: {
          200: feedbackResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "feedback.update";
      request.ctx.resource = { type: "feedback", id: request.params.id };
      request.ctx.fieldsChanged = Object.keys(request.body);

      const isAdmin = request.user.role === ROLES.ADMIN;
      const feedback = await feedbackService.update(
        request.params.id,
        request.body,
        request.user.id,
        isAdmin,
      );

      return reply.send(feedback);
    },
  );

  // ---- DELETE /feedback/:id ----
  server.delete(
    "/:id",
    {
      schema: {
        tags: ["Feedback"],
        summary: "Delete feedback (soft delete)",
        security: [{ bearerAuth: [] }],
        params: feedbackParamsSchema,
        response: {
          200: z.object({ success: z.boolean() }),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "feedback.delete";
      request.ctx.resource = { type: "feedback", id: request.params.id };

      const isAdmin = request.user.role === ROLES.ADMIN;
      await feedbackService.delete(request.params.id, request.user.id, isAdmin);

      return reply.send({ success: true });
    },
  );

  // ---- POST /feedback/:id/responses ----
  server.post(
    "/:id/responses",
    {
      schema: {
        tags: ["Feedback"],
        summary: "Add a response to a feedback",
        security: [{ bearerAuth: [] }],
        params: feedbackParamsSchema,
        body: createResponseSchema,
        response: {
          201: feedbackResponseItemSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "feedback.response.create";
      request.ctx.resource = { type: "feedback", id: request.params.id };

      const isAdmin = request.user.role === ROLES.ADMIN;
      const response = await feedbackService.addResponse(
        request.params.id,
        request.body,
        request.user.id,
        isAdmin,
      );

      return reply.status(201).send(response);
    },
  );

  // ---- POST /feedback/:id/vote ----
  server.post(
    "/:id/vote",
    {
      schema: {
        tags: ["Feedback"],
        summary: "Toggle vote on a feedback",
        security: [{ bearerAuth: [] }],
        params: feedbackParamsSchema,
        response: {
          200: z.object({
            voted: z.boolean(),
            voteCount: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "feedback.vote";
      request.ctx.resource = { type: "feedback", id: request.params.id };

      const result = await feedbackService.toggleVote(
        request.params.id,
        request.user.id,
      );

      return reply.send(result);
    },
  );
}
