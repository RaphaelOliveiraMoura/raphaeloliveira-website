/**
 * Global test setup for Vitest.
 *
 * Environment variables are defined in vitest.config.ts `env` option
 * so they are available before any module is loaded.
 *
 * NOTE: Integration tests require a running PostgreSQL instance.
 * Use `docker compose up -d` before running tests, or set
 * DATABASE_URL to point to a test database.
 */

import { rm } from "node:fs/promises";

import { afterAll } from "vitest";

// Clean up test-uploads directory after all tests
afterAll(async () => {
  try {
    await rm("./test-uploads", { recursive: true, force: true });
  } catch {
    // Directory might not exist
  }
});
