/**
 * Global test setup for Vitest.
 *
 * NOTE: These tests require a running PostgreSQL instance.
 * Use `docker compose up -d` before running tests, or set
 * DATABASE_URL to point to a test database.
 *
 * For CI, you can use a service container (e.g. GitHub Actions
 * `services: postgres:`).
 */

// Set test environment variables before anything else
process.env.NODE_ENV = "test";
process.env.PORT = "0"; // Random port for tests
process.env.HOST = "127.0.0.1";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://corestack:corestack@localhost:5432/corestack_test";
process.env.JWT_SECRET = "test-secret-minimum-16-chars";
process.env.JWT_ACCESS_EXPIRATION = "15m";
process.env.JWT_REFRESH_EXPIRATION = "7d";
process.env.CORS_ORIGIN = "http://localhost:3000";
process.env.LOG_LEVEL = "silent";
