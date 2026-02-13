import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { cleanupTestData, createTestUser } from "../helpers/factories";
import { createTestServer, injectRequest } from "../helpers/test-server";

describe("Auth routes", () => {
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

  describe("POST /auth/login", () => {
    it("should login with valid credentials", async () => {
      const testUser = await createTestUser({
        email: "login@test.com",
        password: "password123",
      });

      const response = await request.post("/auth/login", {
        email: testUser.email,
        password: testUser.password,
      });

      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(body.accessToken).toBeDefined();
      expect(body.user.id).toBe(testUser.id);
      expect(body.user.email).toBe(testUser.email);

      // Should set refresh-token cookie
      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(String(cookies)).toContain("refresh-token");
    });

    it("should reject invalid email", async () => {
      const response = await request.post("/auth/login", {
        email: "nonexistent@test.com",
        password: "password123",
      });

      expect(response.statusCode).toBe(401);
      const body = response.json();
      expect(body.code).toBe("UNAUTHORIZED");
    });

    it("should reject invalid password", async () => {
      await createTestUser({
        email: "wrongpw@test.com",
        password: "password123",
      });

      const response = await request.post("/auth/login", {
        email: "wrongpw@test.com",
        password: "wrongpassword",
      });

      expect(response.statusCode).toBe(401);
    });

    it("should reject invalid body", async () => {
      const response = await request.post("/auth/login", {
        email: "not-an-email",
        password: "12",
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /auth/refresh", () => {
    it("should refresh access token with valid refresh cookie", async () => {
      const testUser = await createTestUser({ email: "refresh@test.com" });

      // Login first to get a refresh token cookie
      const loginResponse = await request.post("/auth/login", {
        email: testUser.email,
        password: testUser.password,
      });

      const cookies = loginResponse.headers["set-cookie"];
      const cookieStr = Array.isArray(cookies)
        ? cookies.join("; ")
        : String(cookies);

      const response = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        headers: { cookie: cookieStr },
      });

      const body = response.json();
      expect(response.statusCode).toBe(200);
      expect(body.accessToken).toBeDefined();
    });

    it("should reject when no refresh token cookie", async () => {
      const response = await request.post("/auth/refresh");
      expect(response.statusCode).toBe(401);
    });
  });

  describe("POST /auth/logout", () => {
    it("should clear the refresh cookie", async () => {
      const response = await request.post("/auth/logout");

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.success).toBe(true);
    });
  });

  describe("GET /auth/me", () => {
    it("should return the authenticated user", async () => {
      const testUser = await createTestUser({
        email: "me@test.com",
        name: "Me User",
      });

      // Login to get access token
      const loginResponse = await request.post("/auth/login", {
        email: testUser.email,
        password: testUser.password,
      });
      const { accessToken } = loginResponse.json();

      const response = await request.get("/auth/me", {
        headers: { authorization: `Bearer ${accessToken}` },
      });

      const body = response.json();
      expect(response.statusCode).toBe(200);
      expect(body.id).toBe(testUser.id);
      expect(body.email).toBe(testUser.email);
      expect(body.name).toBe("Me User");
    });

    it("should reject without auth header", async () => {
      const response = await request.get("/auth/me");
      expect(response.statusCode).toBe(401);
    });
  });
});
