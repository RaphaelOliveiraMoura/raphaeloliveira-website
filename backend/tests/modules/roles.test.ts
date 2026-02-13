import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  cleanupTestData,
  createTestUser,
  loginTestUser,
} from "../helpers/factories";
import { createTestServer, injectRequest } from "../helpers/test-server";

describe("Roles routes", () => {
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
      email: "admin-roles@test.com",
      role: "admin",
    });
    const { accessToken } = await loginTestUser(
      app,
      admin.email,
      admin.password,
    );
    return accessToken;
  }

  describe("POST /roles", () => {
    it("should create a custom role (admin only)", async () => {
      const token = await loginAdmin();

      const response = await request.post(
        "/roles",
        { name: "editor", description: "Can edit content" },
        authHeaders(token),
      );

      const body = response.json();
      expect(response.statusCode).toBe(201);
      expect(body.name).toBe("editor");
      expect(body.description).toBe("Can edit content");
      expect(body.isSystem).toBe(false);
      expect(body.permissions).toEqual([]);
    });

    it("should reject duplicate role names", async () => {
      const token = await loginAdmin();

      await request.post(
        "/roles",
        { name: "duplicate-role" },
        authHeaders(token),
      );

      const response = await request.post(
        "/roles",
        { name: "duplicate-role" },
        authHeaders(token),
      );

      expect(response.statusCode).toBe(409);
    });

    it("should reject non-admin users", async () => {
      const user = await createTestUser({ email: "user-roles@test.com" });
      const { accessToken } = await loginTestUser(
        app,
        user.email,
        user.password,
      );

      const response = await request.post(
        "/roles",
        { name: "sneaky" },
        authHeaders(accessToken),
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe("GET /roles", () => {
    it("should list all roles with permissions", async () => {
      const token = await loginAdmin();

      // Create a role first
      await request.post("/roles", { name: "viewer" }, authHeaders(token));

      const response = await request.get("/roles", authHeaders(token));
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThanOrEqual(1);

      const viewer = body.find((r: { name: string }) => r.name === "viewer");
      expect(viewer).toBeDefined();
      expect(viewer.permissions).toBeDefined();
    });
  });

  describe("PATCH /roles/:id", () => {
    it("should update a role", async () => {
      const token = await loginAdmin();

      const createResp = await request.post(
        "/roles",
        { name: "old-name" },
        authHeaders(token),
      );
      const roleId = createResp.json().id;

      const response = await request.patch(
        `/roles/${roleId}`,
        { name: "new-name", description: "Updated" },
        authHeaders(token),
      );

      expect(response.statusCode).toBe(200);
      expect(response.json().name).toBe("new-name");
      expect(response.json().description).toBe("Updated");
    });
  });

  describe("DELETE /roles/:id", () => {
    it("should delete a custom role", async () => {
      const token = await loginAdmin();

      const createResp = await request.post(
        "/roles",
        { name: "to-delete" },
        authHeaders(token),
      );
      const roleId = createResp.json().id;

      const response = await request.delete(
        `/roles/${roleId}`,
        authHeaders(token),
      );

      expect(response.statusCode).toBe(200);
      expect(response.json().success).toBe(true);
    });
  });

  describe("GET /roles/permissions", () => {
    it("should list all available permissions", async () => {
      const token = await loginAdmin();

      const response = await request.get(
        "/roles/permissions",
        authHeaders(token),
      );
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });
  });
});
