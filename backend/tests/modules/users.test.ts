import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { cleanupTestData, createTestUser } from "../helpers/factories.js";
import { createTestServer, injectRequest } from "../helpers/test-server.js";

describe("Users routes", () => {
  let app: FastifyInstance;
  let request: ReturnType<typeof injectRequest>;
  let adminToken: string;

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

    // Create an admin user and get token
    const admin = await createTestUser({
      email: "admin@test.com",
      role: "admin",
      password: "password123",
    });
    const loginRes = await request.post("/auth/login", {
      email: admin.email,
      password: admin.password,
    });
    adminToken = loginRes.json().accessToken;
  });

  const authHeaders = () => ({ authorization: `Bearer ${adminToken}` });

  describe("GET /users", () => {
    it("should list users (requires auth)", async () => {
      await createTestUser({ email: "list1@test.com" });
      await createTestUser({ email: "list2@test.com" });

      const response = await request.get("/users", { headers: authHeaders() });
      const body = response.json();

      expect(response.statusCode).toBe(200);
      // admin + 2 created = 3
      expect(body.data.length).toBe(3);
      expect(body.meta.total).toBe(3);
      expect(body.meta.page).toBe(1);
    });

    it("should reject without auth", async () => {
      const response = await request.get("/users");
      expect(response.statusCode).toBe(401);
    });

    it("should support pagination", async () => {
      // Create several users
      for (let i = 0; i < 5; i++) {
        await createTestUser({ email: `page-${i}@test.com` });
      }

      const response = await request.get("/users?page=1&limit=2", {
        headers: authHeaders(),
      });
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(body.data.length).toBe(2);
      expect(body.meta.total).toBe(6); // admin + 5
      expect(body.meta.totalPages).toBe(3);
    });
  });

  describe("GET /users/:id", () => {
    it("should get a user by ID", async () => {
      const user = await createTestUser({ email: "getone@test.com" });

      const response = await request.get(`/users/${user.id}`, {
        headers: authHeaders(),
      });
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(body.id).toBe(user.id);
      expect(body.email).toBe(user.email);
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request.get(
        "/users/00000000-0000-0000-0000-000000000000",
        { headers: authHeaders() },
      );

      expect(response.statusCode).toBe(404);
    });
  });

  describe("POST /users", () => {
    it("should create a user (admin only)", async () => {
      const response = await request.post(
        "/users",
        {
          name: "New User",
          email: "new@test.com",
          password: "password123",
        },
        { headers: authHeaders() },
      );

      const body = response.json();
      expect(response.statusCode).toBe(201);
      expect(body.email).toBe("new@test.com");
      expect(body.name).toBe("New User");
      expect(body.role).toBe("user");
    });

    it("should reject duplicate email", async () => {
      await createTestUser({ email: "dup@test.com" });

      const response = await request.post(
        "/users",
        {
          name: "Dup User",
          email: "dup@test.com",
          password: "password123",
        },
        { headers: authHeaders() },
      );

      expect(response.statusCode).toBe(409);
    });

    it("should reject non-admin users", async () => {
      const regularUser = await createTestUser({
        email: "regular@test.com",
        role: "user",
      });
      const loginRes = await request.post("/auth/login", {
        email: regularUser.email,
        password: regularUser.password,
      });
      const userToken = loginRes.json().accessToken;

      const response = await request.post(
        "/users",
        {
          name: "Should Fail",
          email: "fail@test.com",
          password: "password123",
        },
        { headers: { authorization: `Bearer ${userToken}` } },
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe("PATCH /users/:id", () => {
    it("should update a user (admin only)", async () => {
      const user = await createTestUser({ email: "update@test.com" });

      const response = await request.patch(
        `/users/${user.id}`,
        { name: "Updated Name" },
        { headers: authHeaders() },
      );

      const body = response.json();
      expect(response.statusCode).toBe(200);
      expect(body.name).toBe("Updated Name");
    });
  });

  describe("DELETE /users/:id", () => {
    it("should delete a user (admin only)", async () => {
      const user = await createTestUser({ email: "delete@test.com" });

      const response = await request.delete(`/users/${user.id}`, {
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.success).toBe(true);

      // Verify it's gone
      const getRes = await request.get(`/users/${user.id}`, {
        headers: authHeaders(),
      });
      expect(getRes.statusCode).toBe(404);
    });
  });
});
