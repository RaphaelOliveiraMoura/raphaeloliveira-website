import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

import { env } from "./config/env";
import { container } from "./lib/container";
import { logger } from "./lib/logger";
import { auditRoutes } from "./modules/audit/audit.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { healthRoutes } from "./modules/health/health.routes";
import { uploadsRoutes } from "./modules/uploads/uploads.routes";
import { usersRoutes } from "./modules/users/users.routes";
import auditPlugin from "./plugins/audit";
import authPlugin from "./plugins/auth";
import compressPlugin from "./plugins/compress";
import corsPlugin from "./plugins/cors";
import errorHandlerPlugin from "./plugins/error-handler";
import etagPlugin from "./plugins/etag";
import helmetPlugin from "./plugins/helmet";
import metricsPlugin from "./plugins/metrics";
import rateLimitPlugin from "./plugins/rate-limit";
import requestContextPlugin from "./plugins/request-context";
import swaggerPlugin from "./plugins/swagger";
import { ConsoleMailAdapter } from "./services/mail/console.adapter";
import { NodemailerMailAdapter } from "./services/mail/nodemailer.adapter";
import { LocalStorageAdapter } from "./services/storage/local.adapter";
import { S3StorageAdapter } from "./services/storage/s3.adapter";

/**
 * Bootstrap external service providers into the DI container.
 */
function bootstrapServices() {
  // ---- Mail provider ----
  if (env.MAIL_DRIVER === "smtp") {
    container.register(
      "mail",
      new NodemailerMailAdapter({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
        from: env.MAIL_FROM,
      }),
    );
  } else {
    container.register("mail", new ConsoleMailAdapter());
  }

  // ---- Storage provider ----
  if (env.STORAGE_DRIVER === "s3" && env.S3_BUCKET && env.S3_REGION) {
    container.register(
      "storage",
      new S3StorageAdapter({
        bucket: env.S3_BUCKET,
        region: env.S3_REGION,
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
        endpoint: env.S3_ENDPOINT,
      }),
    );
  } else {
    container.register(
      "storage",
      new LocalStorageAdapter({
        basePath: env.STORAGE_LOCAL_PATH,
      }),
    );
  }
}

export async function buildApp() {
  const app = Fastify({
    loggerInstance: logger,
  }).withTypeProvider<ZodTypeProvider>();

  // Set Zod as the validation and serialization compiler
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // ---- Bootstrap services ----
  bootstrapServices();

  // ---- Register plugins ----
  // Order matters: request-context first (decorates request.ctx),
  // then error-handler (enriches ctx on errors), then the rest.
  await app.register(requestContextPlugin);
  await app.register(errorHandlerPlugin);
  await app.register(helmetPlugin);
  await app.register(corsPlugin);
  await app.register(compressPlugin);
  await app.register(etagPlugin);
  await app.register(authPlugin);
  await app.register(rateLimitPlugin);
  await app.register(swaggerPlugin);
  await app.register(metricsPlugin);
  await app.register(auditPlugin);

  // ---- Register routes ----
  await app.register(healthRoutes, { prefix: "/health" });
  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(usersRoutes, { prefix: "/users" });
  await app.register(auditRoutes, { prefix: "/audit" });
  await app.register(uploadsRoutes, { prefix: "/uploads" });

  return app;
}
