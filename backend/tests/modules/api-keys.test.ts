import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  cleanupTestData,
  createTestUser,
  loginTestUser,
} from "../helpers/factories";
import { createTestServer, injectRequest } from "../helpers/test-server";

describe("API Keys routes", () => {
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

  describe("POST /api-keys", () => {
    it("should create an API key and return the full key once", async () => {
      const user = await createTestUser({ email: "apikey@test.com" });
      const { accessToken } = await loginTestUser(
        app,
        user.email,
        user.password,
      );

      const response = await request.post(
        "/api-keys",
        { name: "My Test Key", scopes: ["read"] },
        authHeaders(accessToken),
      );

      const body = response.json();

      expect(response.statusCode).toBe(201);
      expect(body.id).toBeDefined();
      expect(body.name).toBe("My Test Key");
      expect(body.key).toBeDefined();
      expect(body.prefix).toBeDefined();
      // The full key should start with the prefix
      expect(body.key.startsWith(body.prefix)).toBe(true);
    });

    it("should require authentication", async () => {
      const response = await request.post("/api-keys", {
        name: "Unauthorized Key",
      });
      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api-keys", () => {
    it("should list API keys without exposing full key", async () => {
      const user = await createTestUser({ email: "listkeys@test.com" });
      const { accessToken } = await loginTestUser(
        app,
        user.email,
        user.password,
      );

      // Create a key first
      await request.post(
        "/api-keys",
        { name: "Key 1", scopes: ["read"] },
        authHeaders(accessToken),
      );

      const response = await request.get("/api-keys", authHeaders(accessToken));
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(body.data).toBeDefined();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
      expect(body.total).toBeGreaterThanOrEqual(1);
      // Should NOT contain the full key
      expect(body.data[0].key).toBeUndefined();
      expect(body.data[0].prefix).toBeDefined();
      expect(body.data[0].name).toBe("Key 1");
    });
  });

  describe("DELETE /api-keys/:id", () => {
    it("should revoke an API key", async () => {
      const user = await createTestUser({ email: "revokekey@test.com" });
      const { accessToken } = await loginTestUser(
        app,
        user.email,
        user.password,
      );

      // Create a key
      const createResp = await request.post(
        "/api-keys",
        { name: "To Revoke", scopes: ["read"] },
        authHeaders(accessToken),
      );
      const keyId = createResp.json().id;

      // Revoke it
      const response = await request.delete(
        `/api-keys/${keyId}`,
        authHeaders(accessToken),
      );

      expect(response.statusCode).toBe(200);
      expect(response.json().success).toBe(true);
    });
  });

  describe("API Key Authentication", () => {
    it("should authenticate requests using X-API-Key header", async () => {
      const user = await createTestUser({ email: "authkey@test.com" });
      const { accessToken } = await loginTestUser(
        app,
        user.email,
        user.password,
      );

      // Create an API key
      const createResp = await request.post(
        "/api-keys",
        { name: "Auth Key", scopes: ["read"] },
        authHeaders(accessToken),
      );
      const fullKey = createResp.json().key;

      // Use the API key to access a protected route
      const response = await request.get("/auth/me", {
        headers: { "x-api-key": fullKey },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().id).toBe(user.id);
    });

    it("should reject invalid API key", async () => {
      const response = await request.get("/auth/me", {
        headers: { "x-api-key": "invalid-key-that-does-not-exist" },
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
