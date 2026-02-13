import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    env: {
      NODE_ENV: "test",
      PORT: "0",
      HOST: "127.0.0.1",
      DATABASE_URL:
        "postgresql://corestack:corestack@localhost:5433/corestack_test",
      JWT_SECRET: "test-secret-minimum-16-chars",
      JWT_ACCESS_EXPIRATION: "15m",
      JWT_REFRESH_EXPIRATION: "7d",
      CORS_ORIGIN: "http://localhost:3000",
      LOG_LEVEL: "silent",
      LOGIN_MAX_ATTEMPTS: "3",
      LOGIN_LOCKOUT_DURATION: "1m",
      MAIL_DRIVER: "console",
      MAIL_FROM: "test@corestack.dev",
      STORAGE_DRIVER: "local",
      STORAGE_LOCAL_PATH: "./test-uploads",
      CACHE_DRIVER: "memory",
      QUEUE_DRIVER: "memory",
      APP_NAME: "Core Stack Test",
      APP_URL: "http://localhost:3000",
    },
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/server.ts", "src/db/migrations/**", "src/types/**"],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70,
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["tests/lib/**/*.test.ts", "tests/services/**/*.test.ts"],
          setupFiles: ["./tests/setup.ts"],
          sequence: { groupOrder: 1 },
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["tests/modules/**/*.test.ts"],
          globalSetup: ["./tests/global-setup.ts"],
          setupFiles: ["./tests/setup.ts", "./tests/setup-integration.ts"],
          pool: "forks",
          maxWorkers: 3,
          testTimeout: 15_000,
          hookTimeout: 15_000,
          sequence: { groupOrder: 2 },
        },
      },
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
