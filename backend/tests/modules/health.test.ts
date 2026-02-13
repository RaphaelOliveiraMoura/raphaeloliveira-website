import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createTestServer, injectRequest } from "../helpers/test-server";

describe("Health routes", () => {
  let app: FastifyInstance;
  let request: ReturnType<typeof injectRequest>;

  beforeAll(async () => {
    app = await createTestServer();
    request = injectRequest(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /health", () => {
    it("should return status ok", async () => {
      const response = await request.get("/health");
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(body.status).toBe("ok");
      expect(body.database).toBe("connected");
      expect(body.timestamp).toBeDefined();
      expect(body.uptime).toBeGreaterThan(0);
    });
  });

  describe("GET /health/live", () => {
    it("should return liveness probe", async () => {
      const response = await request.get("/health/live");
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(body.status).toBe("alive");
      expect(body.uptime).toBeGreaterThan(0);
      expect(body.timestamp).toBeDefined();
      expect(body.memory).toBeDefined();
      expect(body.memory.rss).toBeGreaterThan(0);
      expect(body.memory.heapUsed).toBeGreaterThan(0);
      expect(body.memory.heapTotal).toBeGreaterThan(0);
    });
  });

  describe("GET /health/ready", () => {
    it("should return readiness probe when services are healthy", async () => {
      const response = await request.get("/health/ready");
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(body.status).toBe("ready");
      expect(body.checks).toBeDefined();
      expect(body.checks.database.status).toBe("ok");
      expect(body.checks.database.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it("should include mail check", async () => {
      const response = await request.get("/health/ready");
      const body = response.json();

      // With MAIL_DRIVER=console, should always be ok
      expect(body.checks.mail.status).toBe("ok");
    });

    it("should include storage check", async () => {
      const response = await request.get("/health/ready");
      const body = response.json();

      // With STORAGE_DRIVER=local, should be ok
      expect(body.checks.storage.status).toBe("ok");
    });
  });
});
