import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  cleanupTestData,
  createTestUser,
  loginTestUser,
} from "../helpers/factories";
import { createTestServer, injectRequest } from "../helpers/test-server";

describe("Feature Flags routes", () => {
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

  async function loginAdmin() {
    const admin = await createTestUser({
      email: "admin-flags@test.com",
      role: "admin",
    });
    const { accessToken } = await loginTestUser(
      app,
      admin.email,
      admin.password,
    );
    return { accessToken, admin };
  }

  describe("POST /feature-flags", () => {
    it("should create a feature flag (admin only)", async () => {
      const { accessToken } = await loginAdmin();

      const response = await request.post(
        "/feature-flags",
        {
          key: "new-dashboard",
          description: "New dashboard UI",
          enabled: false,
        },
        authHeaders(accessToken),
      );

      const body = response.json();
      expect(response.statusCode).toBe(201);
      expect(body.key).toBe("new-dashboard");
      expect(body.enabled).toBe(false);
    });

    it("should reject duplicate flag keys", async () => {
      const { accessToken } = await loginAdmin();

      await request.post(
        "/feature-flags",
        { key: "dupe-flag", enabled: true },
        authHeaders(accessToken),
      );

      const response = await request.post(
        "/feature-flags",
        { key: "dupe-flag", enabled: true },
        authHeaders(accessToken),
      );

      expect(response.statusCode).toBe(409);
    });

    it("should reject non-admin users", async () => {
      const user = await createTestUser({ email: "user-flags@test.com" });
      const { accessToken } = await loginTestUser(
        app,
        user.email,
        user.password,
      );

      const response = await request.post(
        "/feature-flags",
        { key: "sneaky-flag", enabled: true },
        authHeaders(accessToken),
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe("GET /feature-flags", () => {
    it("should list all flags (admin)", async () => {
      const { accessToken } = await loginAdmin();

      await request.post(
        "/feature-flags",
        { key: "flag-a", enabled: true },
        authHeaders(accessToken),
      );
      await request.post(
        "/feature-flags",
        { key: "flag-b", enabled: false },
        authHeaders(accessToken),
      );

      const response = await request.get(
        "/feature-flags",
        authHeaders(accessToken),
      );
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("PATCH /feature-flags/:id", () => {
    it("should update a feature flag", async () => {
      const { accessToken } = await loginAdmin();

      const createResp = await request.post(
        "/feature-flags",
        { key: "updatable-flag", enabled: false },
        authHeaders(accessToken),
      );
      const flagId = createResp.json().id;

      const response = await request.patch(
        `/feature-flags/${flagId}`,
        { enabled: true, description: "Now enabled" },
        authHeaders(accessToken),
      );

      expect(response.statusCode).toBe(200);
      expect(response.json().enabled).toBe(true);
      expect(response.json().description).toBe("Now enabled");
    });
  });

  describe("DELETE /feature-flags/:id", () => {
    it("should delete a feature flag", async () => {
      const { accessToken } = await loginAdmin();

      const createResp = await request.post(
        "/feature-flags",
        { key: "delete-me", enabled: true },
        authHeaders(accessToken),
      );
      const flagId = createResp.json().id;

      const response = await request.delete(
        `/feature-flags/${flagId}`,
        authHeaders(accessToken),
      );

      expect(response.statusCode).toBe(200);
      expect(response.json().success).toBe(true);
    });
  });

  describe("GET /feature-flags/evaluate", () => {
    it("should evaluate flags for the current user", async () => {
      const { accessToken } = await loginAdmin();

      await request.post(
        "/feature-flags",
        { key: "enabled-flag", enabled: true },
        authHeaders(accessToken),
      );
      await request.post(
        "/feature-flags",
        { key: "disabled-flag", enabled: false },
        authHeaders(accessToken),
      );

      const response = await request.get(
        "/feature-flags/evaluate",
        authHeaders(accessToken),
      );
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(body["enabled-flag"]).toBe(true);
      expect(body["disabled-flag"]).toBe(false);
    });

    it("should evaluate flags with role conditions", async () => {
      const { accessToken } = await loginAdmin();

      await request.post(
        "/feature-flags",
        {
          key: "admin-only",
          enabled: true,
          conditions: { roles: ["admin"] },
        },
        authHeaders(accessToken),
      );

      // Admin should see it enabled
      const adminResp = await request.get(
        "/feature-flags/evaluate",
        authHeaders(accessToken),
      );
      expect(adminResp.json()["admin-only"]).toBe(true);

      // Regular user should see it disabled
      const user = await createTestUser({ email: "eval-user@test.com" });
      const { accessToken: userToken } = await loginTestUser(
        app,
        user.email,
        user.password,
      );

      const userResp = await request.get(
        "/feature-flags/evaluate",
        authHeaders(userToken),
      );
      expect(userResp.json()["admin-only"]).toBe(false);
    });
  });
});
