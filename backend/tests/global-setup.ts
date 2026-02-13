/**
 * Vitest global setup — runs once before all integration test files.
 *
 * 1. Pushes the Drizzle schema to the template test database.
 * 2. Creates per-worker databases from the template so each fork
 *    process has its own isolated database for parallel execution.
 */

import { execSync } from "node:child_process";

import postgres from "postgres";

const BASE_URL = "postgresql://corestack:corestack@localhost:5433";
const TEMPLATE_DB = "corestack_test";

/**
 * VITEST_POOL_ID vai de 0 ate maxWorkers (inclusive), entao
 * precisamos de maxWorkers + 1 databases. Com maxWorkers=3
 * no vitest.config.ts, precisamos de 4 databases (IDs 0-3).
 */
const MAX_POOL_ID = 3;

export async function setup() {
  // eslint-disable-next-line no-console
  console.log("\n🗄️  Pushing schema to template database...");

  execSync("npx drizzle-kit push --force", {
    env: { ...process.env, DATABASE_URL: `${BASE_URL}/${TEMPLATE_DB}` },
    stdio: "inherit",
  });

  // eslint-disable-next-line no-console
  console.log("✅ Template database schema is up to date");

  // eslint-disable-next-line no-console
  console.log("🔄 Creating per-worker databases...");

  const client = postgres(`${BASE_URL}/postgres`, {
    onnotice: () => {}, // Suppress PostgreSQL NOTICE messages
  });

  for (let i = 0; i <= MAX_POOL_ID; i++) {
    const dbName = `corestack_test_${i}`;
    await client.unsafe(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`);
    await client.unsafe(
      `CREATE DATABASE "${dbName}" TEMPLATE "${TEMPLATE_DB}"`,
    );
  }

  await client.end();

  // eslint-disable-next-line no-console
  console.log(`✅ Created ${MAX_POOL_ID + 1} worker databases\n`);
}

export async function teardown() {
  const client = postgres(`${BASE_URL}/postgres`, {
    onnotice: () => {},
  });

  for (let i = 0; i <= MAX_POOL_ID; i++) {
    await client.unsafe(
      `DROP DATABASE IF EXISTS "corestack_test_${i}" WITH (FORCE)`,
    );
  }

  await client.end();
}
