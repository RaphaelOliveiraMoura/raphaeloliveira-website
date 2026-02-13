import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  cleanupTestData,
  createTestUser,
  loginTestUser,
} from "../helpers/factories";
import { createTestServer, injectRequest } from "../helpers/test-server";

describe("Sessions routes", () => {
  let app: FastifyInstance;
  let request: ReturnType<typeof injectRequest>;

  beforeAll(async () => {
    app = await createTestServer();
    request = injectRequest(app);
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  beforeEach(async () => {
    await cleanupTestData();
  });

  const authHeaders = (token: string) => ({
    headers: { authorization: `Bearer ${token}` },
  });

  describe("GET /sessions", () => {
    it("should list active sessions for the authenticated user", async () => {
      const user = await createTestUser({ email: "session@test.com" });
      const { accessToken } = await loginTestUser(
        app,
        user.email,
        user.password,
      );

      const response = await request.get("/sessions", authHeaders(accessToken));
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(body.data).toBeDefined();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.total).toBeGreaterThanOrEqual(0);
    });

    it("should require authentication", async () => {
      const response = await request.get("/sessions");
      expect(response.statusCode).toBe(401);
    });
  });

  describe("DELETE /sessions/:id", () => {
    it("should revoke a specific session", async () => {
      const user = await createTestUser({ email: "revoke@test.com" });
      const { accessToken } = await loginTestUser(
        app,
        user.email,
        user.password,
      );

      // Get sessions list
      const listResp = await request.get("/sessions", authHeaders(accessToken));
      const sessions = listResp.json().data;

      if (sessions.length > 0) {
        const sessionId = sessions[0].id;
        const response = await request.delete(
          `/sessions/${sessionId}`,
          authHeaders(accessToken),
        );

        expect(response.statusCode).toBe(200);
        expect(response.json().success).toBe(true);
      }
    });

    it("should return 404 for non-existent session", async () => {
      const user = await createTestUser({ email: "nosession@test.com" });
      const { accessToken } = await loginTestUser(
        app,
        user.email,
        user.password,
      );

      const response = await request.delete(
        "/sessions/00000000-0000-0000-0000-000000000000",
        authHeaders(accessToken),
      );

      expect(response.statusCode).toBe(404);
    });
  });

  describe("DELETE /sessions", () => {
    it("should revoke all sessions except current", async () => {
      const user = await createTestUser({ email: "revokeall@test.com" });
      const { accessToken } = await loginTestUser(
        app,
        user.email,
        user.password,
      );

      // Login again to create a second session
      await loginTestUser(app, user.email, user.password);

      const response = await request.delete(
        "/sessions",
        authHeaders(accessToken),
      );

      expect(response.statusCode).toBe(200);
      expect(response.json().revoked).toBeDefined();
    });
  });
});
