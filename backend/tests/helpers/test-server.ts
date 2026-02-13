import type { FastifyInstance } from "fastify";

import { buildApp } from "../../src/app.js";

/**
 * Create a test Fastify instance. Call `.close()` in afterAll.
 *
 * Usage:
 * ```ts
 * let app: FastifyInstance;
 * beforeAll(async () => { app = await createTestServer(); });
 * afterAll(async () => { await app.close(); });
 * ```
 */
export async function createTestServer(): Promise<FastifyInstance> {
  const app = await buildApp();
  await app.ready();
  return app;
}

/**
 * Helper to inject requests into the test server.
 */
export function injectRequest(app: FastifyInstance) {
  return {
    get: (url: string, opts?: { headers?: Record<string, string> }) =>
      app.inject({ method: "GET", url, headers: opts?.headers }),

    post: (
      url: string,
      payload?: unknown,
      opts?: { headers?: Record<string, string> },
    ) =>
      app.inject({
        method: "POST",
        url,
        payload: payload as Record<string, unknown>,
        headers: {
          "content-type": "application/json",
          ...opts?.headers,
        },
      }),

    patch: (
      url: string,
      payload?: unknown,
      opts?: { headers?: Record<string, string> },
    ) =>
      app.inject({
        method: "PATCH",
        url,
        payload: payload as Record<string, unknown>,
        headers: {
          "content-type": "application/json",
          ...opts?.headers,
        },
      }),

    delete: (url: string, opts?: { headers?: Record<string, string> }) =>
      app.inject({ method: "DELETE", url, headers: opts?.headers }),
  };
}
