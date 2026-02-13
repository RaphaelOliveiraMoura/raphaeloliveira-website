import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  cleanupTestData,
  createTestUser,
  loginTestUser,
} from "../helpers/factories";
import { createTestServer, injectRequest } from "../helpers/test-server";

describe("Search routes", () => {
  let app: FastifyInstance;
  let request: ReturnType<typeof injectRequest>;
  let adminToken: string;

  beforeAll(async () => {
    app = await createTestServer();
    request = injectRequest(app);

    // Create admin user and login
    const admin = await createTestUser({
      name: "Search Admin",
      email: "search-admin@test.com",
      role: "admin",
    });
    const login = await loginTestUser(app, admin.email, admin.password);
    adminToken = login.accessToken;

    // Create some searchable users
    await createTestUser({ name: "Alice Johnson", email: "alice@test.com" });
    await createTestUser({ name: "Bob Smith", email: "bob@test.com" });
    await createTestUser({ name: "Charlie Brown", email: "charlie@test.com" });
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  describe("GET /search", () => {
    it("should require authentication", async () => {
      const response = await request.get("/search?q=test");
      expect(response.statusCode).toBe(401);
    });

    it("should search across entities", async () => {
      const response = await request.get("/search?q=Alice", {
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.results).toBeDefined();
      expect(Array.isArray(body.results)).toBe(true);
      expect(body.total).toBeTypeOf("number");
    });

    it("should filter by entity type", async () => {
      const response = await request.get("/search?q=Alice&types=users", {
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();

      // All results should be of type "users"
      for (const result of body.results) {
        expect(result.type).toBe("users");
      }
    });

    it("should return empty results for non-matching query", async () => {
      const response = await request.get("/search?q=zzzznonexistent", {
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.results).toHaveLength(0);
      expect(body.total).toBe(0);
    });

    it("should require q parameter", async () => {
      const response = await request.get("/search", {
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should respect limit parameter", async () => {
      const response = await request.get("/search?q=test&limit=2", {
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.results.length).toBeLessThanOrEqual(2);
    });

    it("should return results with correct shape", async () => {
      const response = await request.get("/search?q=Alice", {
        headers: { authorization: `Bearer ${adminToken}` },
      });

      const body = response.json();
      if (body.results.length > 0) {
        const result = body.results[0];
        expect(result).toHaveProperty("type");
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("title");
        expect(result).toHaveProperty("rank");
        expect(result.rank).toBeTypeOf("number");
      }
    });

    it("should support multiple types filter", async () => {
      const response = await request.get(
        "/search?q=test&types=users,notifications",
        { headers: { authorization: `Bearer ${adminToken}` } },
      );

      expect(response.statusCode).toBe(200);
      const body = response.json();

      for (const result of body.results) {
        expect(["users", "notifications"]).toContain(result.type);
      }
    });
  });
});
