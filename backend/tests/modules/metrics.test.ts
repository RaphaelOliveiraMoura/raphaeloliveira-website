import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createTestServer, injectRequest } from "../helpers/test-server";

describe("Metrics & Security headers", () => {
  let app: FastifyInstance;
  let request: ReturnType<typeof injectRequest>;

  beforeAll(async () => {
    app = await createTestServer();
    request = injectRequest(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /metrics should return Prometheus metrics", async () => {
    // Make a request first to generate metrics
    await request.get("/health");

    const response = await request.get("/metrics");

    expect(response.statusCode).toBe(200);
    const body = response.body;

    // Should contain standard Node.js metrics
    expect(body).toContain("process_cpu_user_seconds_total");

    // Should contain custom HTTP metrics
    expect(body).toContain("http_request_duration_seconds");
    expect(body).toContain("http_requests_total");
  });

  it("should include security headers from helmet", async () => {
    const response = await request.get("/health");
    const headers = response.headers;

    // Helmet adds these headers
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
  });

  it("should include ETag header", async () => {
    const response = await request.get("/health");

    // @fastify/etag should add an etag
    expect(response.headers.etag).toBeDefined();
  });
});
