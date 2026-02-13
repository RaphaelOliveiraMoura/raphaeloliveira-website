/**
 * Vitest global setup — runs once before all test files.
 *
 * Pushes the Drizzle schema to the test database so tables
 * are always in sync with the current schema definitions.
 */

import { execSync } from "node:child_process";

const TEST_DATABASE_URL =
  "postgresql://corestack:corestack@localhost:5433/corestack_test";

export function setup() {
  // eslint-disable-next-line no-console
  console.log("\n🗄️  Pushing schema to test database...");

  execSync("npx drizzle-kit push --force", {
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: "inherit",
  });

  // eslint-disable-next-line no-console
  console.log("✅ Test database schema is up to date\n");
}
