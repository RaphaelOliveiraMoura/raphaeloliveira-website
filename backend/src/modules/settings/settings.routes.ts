import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { ROLES } from "../../config/constants";
import { authenticate } from "../../hooks/authenticate";
import { authorize } from "../../hooks/authorize";
import {
  settingResponseSchema,
  updateSettingsSchema,
} from "./settings.schemas";
import { SettingsService } from "./settings.service";

export async function settingsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const settingsService = new SettingsService();

  // ---- GET /settings ----
  server.get(
    "/",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["Settings"],
        summary: "Get user settings (merged with system defaults)",
        security: [{ bearerAuth: [] }],
        response: {
          200: z.array(settingResponseSchema),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "settings.list-user";

      const settings = await settingsService.getUserSettingsMerged(
        request.user.id,
      );

      return reply.send(settings);
    },
  );

  // ---- PUT /settings ----
  server.put(
    "/",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["Settings"],
        summary: "Update user settings (batch)",
        security: [{ bearerAuth: [] }],
        body: updateSettingsSchema,
        response: {
          200: z.array(settingResponseSchema),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "settings.update-user";

      const updated = await settingsService.updateUserSettings(
        request.user.id,
        request.body,
      );

      return reply.send(
        updated.map((s) => ({
          key: s.key,
          value: s.value,
          source: "user" as const,
          updatedAt: s.updatedAt.toISOString(),
        })),
      );
    },
  );

  // ---- GET /settings/system ----
  server.get(
    "/system",
    {
      preHandler: [authenticate, authorize(ROLES.ADMIN)],
      schema: {
        tags: ["Settings"],
        summary: "Get system settings (admin)",
        security: [{ bearerAuth: [] }],
        response: {
          200: z.array(settingResponseSchema),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "settings.list-system";

      const settings = await settingsService.getSystemSettings();

      return reply.send(settings);
    },
  );

  // ---- PUT /settings/system ----
  server.put(
    "/system",
    {
      preHandler: [authenticate, authorize(ROLES.ADMIN)],
      schema: {
        tags: ["Settings"],
        summary: "Update system settings (admin)",
        security: [{ bearerAuth: [] }],
        body: updateSettingsSchema,
        response: {
          200: z.array(settingResponseSchema),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "settings.update-system";

      const updated = await settingsService.updateSystemSettings(request.body);

      return reply.send(
        updated.map((s) => ({
          key: s.key,
          value: s.value,
          source: "system" as const,
          updatedAt: s.updatedAt.toISOString(),
        })),
      );
    },
  );
}
