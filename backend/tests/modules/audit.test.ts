import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { db } from "../../src/db/index";
import { auditLogs } from "../../src/db/schema/index";
import {
  cleanupTestData,
  createTestUser,
  loginTestUser,
} from "../helpers/factories";
import { createTestServer, injectRequest } from "../helpers/test-server";

describe("Audit routes", () => {
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

    // Create admin and login
    const admin = await createTestUser({
      email: "audit-admin@test.com",
      role: "admin",
    });
    const { accessToken } = await loginTestUser(
      app,
      admin.email,
      admin.password,
    );
    adminToken = accessToken;
  });

  const adminHeaders = () => ({
    authorization: `Bearer ${adminToken}`,
  });

  describe("Automatic audit logging", () => {
    it("should create audit log on user creation", async () => {
      // Create a user (mutation)
      const createRes = await request.post(
        "/users",
        {
          name: "Audited User",
          email: "audited@test.com",
          password: "password123",
        },
        { headers: adminHeaders() },
      );
      expect(createRes.statusCode).toBe(201);

      // Wait a tick for the onResponse hook to fire
      await new Promise((r) => setTimeout(r, 100));

      // Check audit logs
      const logs = await db.select().from(auditLogs);
      const createLog = logs.find((l) => l.action === "user.create");

      expect(createLog).toBeDefined();
      expect(createLog!.resourceType).toBe("user");
      expect(createLog!.actorEmail).toBe("audit-admin@test.com");
    });

    it("should create audit log on user deletion", async () => {
      const user = await createTestUser({ email: "to-delete@test.com" });

      await request.delete(`/users/${user.id}`, {
        headers: adminHeaders(),
      });

      await new Promise((r) => setTimeout(r, 100));

      const logs = await db.select().from(auditLogs);
      const deleteLog = logs.find((l) => l.action === "user.delete");

      expect(deleteLog).toBeDefined();
      expect(deleteLog!.resourceId).toBe(user.id);
    });
  });

  describe("GET /audit", () => {
    it("should list audit logs (admin only)", async () => {
      // Perform a mutation to generate audit log
      await request.post(
        "/users",
        {
          name: "AuditList User",
          email: "audit-list@test.com",
          password: "password123",
        },
        { headers: adminHeaders() },
      );

      await new Promise((r) => setTimeout(r, 100));

      const response = await request.get("/audit", {
        headers: adminHeaders(),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data).toBeDefined();
      expect(body.meta).toBeDefined();
      expect(body.data.length).toBeGreaterThan(0);
    });

    it("should reject non-admin users", async () => {
      const regularUser = await createTestUser({
        email: "regular-audit@test.com",
        role: "user",
      });
      const { accessToken } = await loginTestUser(
        app,
        regularUser.email,
        regularUser.password,
      );

      const response = await request.get("/audit", {
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(403);
    });

    it("should reject unauthenticated requests", async () => {
      const response = await request.get("/audit");
      expect(response.statusCode).toBe(401);
    });

    it("should support filtering by action", async () => {
      // Create and delete to generate different action types
      const user = await createTestUser({ email: "filter@test.com" });
      await request.delete(`/users/${user.id}`, {
        headers: adminHeaders(),
      });

      await new Promise((r) => setTimeout(r, 100));

      const response = await request.get("/audit?action=user.delete", {
        headers: adminHeaders(),
      });

      const body = response.json();
      expect(response.statusCode).toBe(200);
      for (const log of body.data) {
        expect(log.action).toBe("user.delete");
      }
    });
  });
});
