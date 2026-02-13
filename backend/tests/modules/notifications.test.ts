import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { db } from "../../src/db/index";
import { notifications } from "../../src/db/schema/index";
import {
  cleanupTestData,
  createTestUser,
  loginTestUser,
} from "../helpers/factories";
import { createTestServer, injectRequest } from "../helpers/test-server";

describe("Notifications routes", () => {
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

  async function createNotification(
    userId: string,
    overrides: Partial<{ readAt: Date }> = {},
  ) {
    const [notif] = await db
      .insert(notifications)
      .values({
        userId,
        type: "info",
        channel: "system",
        title: "Test notification",
        body: "This is a test",
        ...overrides,
      })
      .returning();
    return notif!;
  }

  describe("GET /notifications", () => {
    it("should list notifications for the authenticated user", async () => {
      const user = await createTestUser({ email: "notif@test.com" });
      const { accessToken } = await loginTestUser(
        app,
        user.email,
        user.password,
      );

      // Create a notification directly in DB
      await createNotification(user.id);

      const response = await request.get(
        "/notifications",
        authHeaders(accessToken),
      );
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(body.data).toBeDefined();
      expect(body.data.length).toBeGreaterThanOrEqual(1);
      expect(body.data[0].title).toBe("Test notification");
    });

    it("should require authentication", async () => {
      const response = await request.get("/notifications");
      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /notifications/unread-count", () => {
    it("should return the count of unread notifications", async () => {
      const user = await createTestUser({ email: "unread@test.com" });
      const { accessToken } = await loginTestUser(
        app,
        user.email,
        user.password,
      );

      // Create 2 unread + 1 read
      await createNotification(user.id);
      await createNotification(user.id);
      await createNotification(user.id, { readAt: new Date() });

      const response = await request.get(
        "/notifications/unread-count",
        authHeaders(accessToken),
      );

      expect(response.statusCode).toBe(200);
      expect(response.json().count).toBe(2);
    });
  });

  describe("PATCH /notifications/:id/read", () => {
    it("should mark a notification as read", async () => {
      const user = await createTestUser({ email: "markread@test.com" });
      const { accessToken } = await loginTestUser(
        app,
        user.email,
        user.password,
      );

      const notif = await createNotification(user.id);

      const response = await request.patch(
        `/notifications/${notif.id}/read`,
        {},
        authHeaders(accessToken),
      );

      expect(response.statusCode).toBe(200);
      expect(response.json().success).toBe(true);
    });
  });

  describe("POST /notifications/read-all", () => {
    it("should mark all notifications as read", async () => {
      const user = await createTestUser({ email: "readall@test.com" });
      const { accessToken } = await loginTestUser(
        app,
        user.email,
        user.password,
      );

      await createNotification(user.id);
      await createNotification(user.id);

      const response = await request.post(
        "/notifications/read-all",
        {},
        authHeaders(accessToken),
      );

      expect(response.statusCode).toBe(200);

      // Verify unread count is now 0
      const countResp = await request.get(
        "/notifications/unread-count",
        authHeaders(accessToken),
      );
      expect(countResp.json().count).toBe(0);
    });
  });

  describe("DELETE /notifications/:id", () => {
    it("should delete a notification", async () => {
      const user = await createTestUser({ email: "delnotif@test.com" });
      const { accessToken } = await loginTestUser(
        app,
        user.email,
        user.password,
      );

      const notif = await createNotification(user.id);

      const response = await request.delete(
        `/notifications/${notif.id}`,
        authHeaders(accessToken),
      );

      expect(response.statusCode).toBe(200);
      expect(response.json().success).toBe(true);

      // Verify it's gone
      const listResp = await request.get(
        "/notifications",
        authHeaders(accessToken),
      );
      const found = listResp
        .json()
        .data.find((n: { id: string }) => n.id === notif.id);
      expect(found).toBeUndefined();
    });
  });

  describe("GET /notifications/preferences", () => {
    it("should return notification preferences", async () => {
      const user = await createTestUser({ email: "prefs@test.com" });
      const { accessToken } = await loginTestUser(
        app,
        user.email,
        user.password,
      );

      const response = await request.get(
        "/notifications/preferences",
        authHeaders(accessToken),
      );

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.json())).toBe(true);
    });
  });

  describe("PUT /notifications/preferences", () => {
    it("should update notification preferences", async () => {
      const user = await createTestUser({ email: "updateprefs@test.com" });
      const { accessToken } = await loginTestUser(
        app,
        user.email,
        user.password,
      );

      const response = await request.put(
        "/notifications/preferences",
        [{ channel: "system", inApp: true, email: false }],
        authHeaders(accessToken),
      );

      expect(response.statusCode).toBe(200);
    });
  });
});
