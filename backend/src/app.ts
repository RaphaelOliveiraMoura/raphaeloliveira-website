import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

import { logger } from "./lib/logger";
import { authRoutes } from "./modules/auth/auth.routes";
import { healthRoutes } from "./modules/health/health.routes";
import { usersRoutes } from "./modules/users/users.routes";
import authPlugin from "./plugins/auth";
import corsPlugin from "./plugins/cors";
import errorHandlerPlugin from "./plugins/error-handler";
import rateLimitPlugin from "./plugins/rate-limit";
import requestContextPlugin from "./plugins/request-context";
import swaggerPlugin from "./plugins/swagger";

export async function buildApp() {
  const app = Fastify({
    loggerInstance: logger,
  }).withTypeProvider<ZodTypeProvider>();

  // Set Zod as the validation and serialization compiler
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // ---- Register plugins ----
  // Order matters: request-context first (decorates request.ctx),
  // then error-handler (enriches ctx on errors), then the rest.
  await app.register(requestContextPlugin);
  await app.register(errorHandlerPlugin);
  await app.register(corsPlugin);
  await app.register(authPlugin);
  await app.register(rateLimitPlugin);
  await app.register(swaggerPlugin);

  // ---- Register routes ----
  await app.register(healthRoutes, { prefix: "/health" });
  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(usersRoutes, { prefix: "/users" });

  return app;
}
