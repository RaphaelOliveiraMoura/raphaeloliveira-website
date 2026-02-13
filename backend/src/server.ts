import { buildApp } from "./app";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import { createShutdownHandler } from "./lib/shutdown";

const log = logger.child({ module: "server" });

async function start() {
  const app = await buildApp();

  const shutdown = createShutdownHandler(app);

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  // Handle uncaught errors
  process.on("uncaughtException", (err) => {
    log.fatal(err, "Uncaught exception");
    shutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason) => {
    log.fatal({ reason }, "Unhandled rejection");
    shutdown("unhandledRejection");
  });

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
  } catch (err) {
    log.fatal(err, "Failed to start server");
    process.exit(1);
  }
}

start();
