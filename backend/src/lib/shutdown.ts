import { closeDatabase } from "../db/index";
import { container } from "./container";
import { domainEvents } from "./events";
import { logger } from "./logger";

const log = logger.child({ module: "shutdown" });

/** Timeout in milliseconds to wait for in-flight requests to drain. */
const SHUTDOWN_TIMEOUT_MS = 30_000;

interface Closeable {
  close(): Promise<void>;
}

/**
 * Cria um handler de graceful shutdown para a instancia Fastify.
 *
 * Sequencia: drain connections → remove event listeners → close queue →
 * close cache → clear container → close database.
 */
export function createShutdownHandler(app: Closeable) {
  let isShuttingDown = false;

  return async (signal: string) => {
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

      // 3. Close queue (stop processing jobs)
      try {
        const queue = container.resolve("queue");
        log.info("Closing job queue...");
        await queue.close();
        log.info("Job queue closed");
      } catch {
        log.debug("No queue to close (or already closed)");
      }

      // 4. Flush and close cache
      try {
        const cache = container.resolve("cache");
        if ("close" in cache && typeof cache.close === "function") {
          log.info("Closing cache connection...");
          await (cache as { close: () => Promise<void> }).close();
          log.info("Cache connection closed");
        }
      } catch {
        log.debug("No cache to close (or already closed)");
      }

      // 5. Clear the service container
      log.info("Clearing service container...");
      container.clear();

      // 6. Close database connection pool
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
}
