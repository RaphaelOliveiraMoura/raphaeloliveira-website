import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "../config/env";
import { logger } from "../lib/logger";
import * as schema from "./schema/index";

const log = logger.child({ module: "db" });

/**
 * PostgreSQL connection (via postgres.js driver).
 * Max 10 connections for the app; 1 for tests.
 */
const client = postgres(env.DATABASE_URL, {
  max: env.NODE_ENV === "test" ? 1 : 10,
});

/**
 * Drizzle ORM instance with typed schema.
 */
export const db = drizzle(client, { schema });

export type Database = typeof db;

/**
 * Close the database connection pool.
 * Call this on graceful shutdown.
 */
export async function closeDatabase(): Promise<void> {
  log.info("Closing database connection pool");
  await client.end();
  log.info("Database connection pool closed");
}
