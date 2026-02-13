import multipart from "@fastify/multipart";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { authenticate } from "../../hooks/authenticate";
import { ValidationError } from "../../lib/errors";
import {
  listUploadsQuerySchema,
  MAX_FILE_SIZE,
  uploadParamsSchema,
  uploadResponseSchema,
  uploadsListResponseSchema,
} from "./uploads.schemas";
import { UploadsService } from "./uploads.service";

export async function uploadsRoutes(app: FastifyInstance) {
  // Register multipart plugin for this scope
  await app.register(multipart, {
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: 1,
    },
  });

  const server = app.withTypeProvider<ZodTypeProvider>();
  const uploadsService = new UploadsService();

  // All upload routes require authentication
  server.addHook("preHandler", authenticate);

  // ---- POST /uploads ----
  server.post(
    "/",
    {
      schema: {
        tags: ["Uploads"],
        summary: "Upload a file",
        security: [{ bearerAuth: [] }],
        consumes: ["multipart/form-data"],
        response: {
          201: uploadResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "upload.create";

      const file = await request.file();

      if (!file) {
        throw new ValidationError({ file: "No file provided" });
      }

      const buffer = await file.toBuffer();

      const result = await uploadsService.upload({
        filename: file.filename,
        mimetype: file.mimetype,
        data: buffer,
        uploadedBy: request.user.id,
      });

      request.ctx.resource = { type: "upload", id: result.id };

      return reply.status(201).send(result);
    },
  );

  // ---- GET /uploads ----
  server.get(
    "/",
    {
      schema: {
        tags: ["Uploads"],
        summary: "List uploads (paginated)",
        security: [{ bearerAuth: [] }],
        querystring: listUploadsQuerySchema,
        response: {
          200: uploadsListResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "upload.list";

      const result = await uploadsService.list(request.query);

      request.ctx.resultCount = result.data.length;
      request.ctx.resultTotal = result.meta.total;

      return reply.send(result);
    },
  );

  // ---- GET /uploads/:id ----
  server.get(
    "/:id",
    {
      schema: {
        tags: ["Uploads"],
        summary: "Get upload metadata and signed URL",
        security: [{ bearerAuth: [] }],
        params: uploadParamsSchema,
        response: {
          200: uploadResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "upload.get";
      request.ctx.resource = { type: "upload", id: request.params.id };

      const upload = await uploadsService.getById(request.params.id);
      return reply.send(upload);
    },
  );

  // ---- DELETE /uploads/:id ----
  server.delete(
    "/:id",
    {
      schema: {
        tags: ["Uploads"],
        summary: "Delete an upload",
        security: [{ bearerAuth: [] }],
        params: uploadParamsSchema,
        response: {
          200: z.object({ success: z.boolean() }),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "upload.delete";
      request.ctx.resource = { type: "upload", id: request.params.id };

      await uploadsService.delete(request.params.id);
      return reply.send({ success: true });
    },
  );
}
