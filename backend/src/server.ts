import { buildApp } from "./app";
import { env } from "./config/env";
import { closeDatabase } from "./db/index";
import { container } from "./lib/container";
import { domainEvents } from "./lib/events";
import { logger } from "./lib/logger";

const log = logger.child({ module: "server" });

/** Timeout in milliseconds to wait for in-flight requests to drain. */
const SHUTDOWN_TIMEOUT_MS = 30_000;

async function start() {
  const app = await buildApp();

  let isShuttingDown = false;

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    if (isShuttingDown) {
      log.warn({ signal }, "Forced shutdown — already shutting down");
      process.exit(1);
    }

    isShuttingDown = true;
    log.info({ signal }, "Received shutdown signal, closing gracefully...");

    // Set a hard timeout to force exit
    const forceExitTimeout = setTimeout(() => {
      log.error("Graceful shutdown timed out, forcing exit");
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    // Don't keep the process alive just for the timeout
    forceExitTimeout.unref();

    try {
      // 1. Stop accepting new connections and drain in-flight requests
      log.info("Closing Fastify server (draining connections)...");
      await app.close();
      log.info("Fastify server closed");

      // 2. Remove all domain event listeners
      log.info("Cleaning up event listeners...");
      domainEvents.removeAllListeners();

      // 3. Clear the service container
      log.info("Clearing service container...");
      container.clear();

      // 4. Close database connection pool
      log.info("Closing database connection pool...");
      await closeDatabase();
      log.info("Database connection pool closed");

      log.info("Graceful shutdown complete");
      process.exit(0);
    } catch (err) {
      log.fatal(err, "Error during graceful shutdown");
      process.exit(1);
    }
  };

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
