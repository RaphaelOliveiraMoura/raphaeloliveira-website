import { buildApp } from "./app";
import { env } from "./config/env";
import { closeDatabase } from "./db/index";
import { logger } from "./lib/logger";

const log = logger.child({ module: "server" });

async function start() {
  const app = await buildApp();

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    log.info({ signal }, "Received shutdown signal, closing gracefully...");
    await app.close();
    await closeDatabase();
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
  } catch (err) {
    log.fatal(err, "Failed to start server");
    process.exit(1);
  }
}

start();
