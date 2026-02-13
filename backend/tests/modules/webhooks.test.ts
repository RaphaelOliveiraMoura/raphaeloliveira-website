import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  cleanupTestData,
  createTestUser,
  loginTestUser,
} from "../helpers/factories";
import { createTestServer, injectRequest } from "../helpers/test-server";

describe("Webhooks routes", () => {
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

  async function loginUser() {
    const user = await createTestUser({ email: "webhook@test.com" });
    const { accessToken } = await loginTestUser(app, user.email, user.password);
    return { accessToken, user };
  }

  describe("POST /webhooks", () => {
    it("should create a webhook and return secret once", async () => {
      const { accessToken } = await loginUser();

      const response = await request.post(
        "/webhooks",
        {
          url: "https://example.com/webhook",
          events: ["user.created", "user.updated"],
          description: "Test webhook",
        },
        authHeaders(accessToken),
      );

      const body = response.json();
      expect(response.statusCode).toBe(201);
      expect(body.id).toBeDefined();
      expect(body.url).toBe("https://example.com/webhook");
      expect(body.events).toEqual(["user.created", "user.updated"]);
      expect(body.active).toBe(true);
      expect(body.secret).toBeDefined();
      expect(body.secret.startsWith("whsec_")).toBe(true);
    });

    it("should require at least one event", async () => {
      const { accessToken } = await loginUser();

      const response = await request.post(
        "/webhooks",
        { url: "https://example.com/webhook", events: [] },
        authHeaders(accessToken),
      );

      expect(response.statusCode).toBe(400);
    });

    it("should require a valid URL", async () => {
      const { accessToken } = await loginUser();

      const response = await request.post(
        "/webhooks",
        { url: "not-a-url", events: ["user.created"] },
        authHeaders(accessToken),
      );

      expect(response.statusCode).toBe(400);
    });

    it("should require authentication", async () => {
      const response = await request.post("/webhooks", {
        url: "https://example.com",
        events: ["user.created"],
      });
      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /webhooks", () => {
    it("should list webhooks for the current user", async () => {
      const { accessToken } = await loginUser();

      // Create two webhooks
      await request.post(
        "/webhooks",
        {
          url: "https://example.com/hook1",
          events: ["user.created"],
        },
        authHeaders(accessToken),
      );
      await request.post(
        "/webhooks",
        {
          url: "https://example.com/hook2",
          events: ["user.updated"],
        },
        authHeaders(accessToken),
      );

      const response = await request.get("/webhooks", authHeaders(accessToken));
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(2);
      // Should NOT include the secret in list response
      expect(body[0].secret).toBeUndefined();
    });

    it("should not show other users webhooks", async () => {
      const { accessToken: token1 } = await loginUser();
      await request.post(
        "/webhooks",
        {
          url: "https://example.com/hook",
          events: ["user.created"],
        },
        authHeaders(token1),
      );

      // Create another user
      const user2 = await createTestUser({ email: "webhook2@test.com" });
      const { accessToken: token2 } = await loginTestUser(
        app,
        user2.email,
        user2.password,
      );

      const response = await request.get("/webhooks", authHeaders(token2));
      expect(response.json()).toEqual([]);
    });
  });

  describe("PATCH /webhooks/:id", () => {
    it("should update a webhook", async () => {
      const { accessToken } = await loginUser();

      const createResp = await request.post(
        "/webhooks",
        {
          url: "https://example.com/old",
          events: ["user.created"],
        },
        authHeaders(accessToken),
      );
      const webhookId = createResp.json().id;

      const response = await request.patch(
        `/webhooks/${webhookId}`,
        {
          url: "https://example.com/new",
          events: ["user.created", "user.deleted"],
          active: false,
        },
        authHeaders(accessToken),
      );

      expect(response.statusCode).toBe(200);
      expect(response.json().url).toBe("https://example.com/new");
      expect(response.json().active).toBe(false);
    });

    it("should not allow updating another user's webhook", async () => {
      const { accessToken: token1 } = await loginUser();
      const createResp = await request.post(
        "/webhooks",
        {
          url: "https://example.com/hook",
          events: ["user.created"],
        },
        authHeaders(token1),
      );
      const webhookId = createResp.json().id;

      const user2 = await createTestUser({ email: "hacker@test.com" });
      const { accessToken: token2 } = await loginTestUser(
        app,
        user2.email,
        user2.password,
      );

      const response = await request.patch(
        `/webhooks/${webhookId}`,
        { url: "https://evil.com" },
        authHeaders(token2),
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe("DELETE /webhooks/:id", () => {
    it("should delete a webhook", async () => {
      const { accessToken } = await loginUser();

      const createResp = await request.post(
        "/webhooks",
        {
          url: "https://example.com/hook",
          events: ["user.created"],
        },
        authHeaders(accessToken),
      );
      const webhookId = createResp.json().id;

      const response = await request.delete(
        `/webhooks/${webhookId}`,
        authHeaders(accessToken),
      );

      expect(response.statusCode).toBe(200);
      expect(response.json().success).toBe(true);

      // Verify it's gone
      const listResp = await request.get("/webhooks", authHeaders(accessToken));
      expect(listResp.json()).toEqual([]);
    });
  });

  describe("GET /webhooks/:id/deliveries", () => {
    it("should list deliveries for a webhook", async () => {
      const { accessToken } = await loginUser();

      const createResp = await request.post(
        "/webhooks",
        {
          url: "https://example.com/hook",
          events: ["user.created"],
        },
        authHeaders(accessToken),
      );
      const webhookId = createResp.json().id;

      const response = await request.get(
        `/webhooks/${webhookId}/deliveries`,
        authHeaders(accessToken),
      );

      expect(response.statusCode).toBe(200);
      expect(response.json().data).toBeDefined();
      expect(Array.isArray(response.json().data)).toBe(true);
      expect(response.json().total).toBeDefined();
    });
  });

  describe("POST /webhooks/:id/test", () => {
    it("should send a test event", async () => {
      const { accessToken } = await loginUser();

      const createResp = await request.post(
        "/webhooks",
        {
          url: "https://example.com/hook",
          events: ["webhook.test"],
        },
        authHeaders(accessToken),
      );
      const webhookId = createResp.json().id;

      const response = await request.post(
        `/webhooks/${webhookId}/test`,
        {},
        authHeaders(accessToken),
      );

      expect(response.statusCode).toBe(200);
      expect(response.json().success).toBe(true);

      // Wait briefly for async delivery creation
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify a delivery was created
      const deliveriesResp = await request.get(
        `/webhooks/${webhookId}/deliveries`,
        authHeaders(accessToken),
      );
      expect(deliveriesResp.json().total).toBeGreaterThanOrEqual(1);
    });
  });
});
