import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    fileParallelism: false,
    globalSetup: ["./tests/global-setup.ts"],
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts"],
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
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
