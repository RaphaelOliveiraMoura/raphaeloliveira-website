import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  cleanupTestData,
  createTestUser,
  loginTestUser,
  type TestUser,
} from "../helpers/factories";
import { createTestServer, injectRequest } from "../helpers/test-server";

describe("Feedback routes", () => {
  let app: FastifyInstance;
  let request: ReturnType<typeof injectRequest>;
  let admin: TestUser;
  let user: TestUser;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    app = await createTestServer();
    request = injectRequest(app);

    admin = await createTestUser({
      name: "Feedback Admin",
      email: "feedback-admin@test.com",
      role: "admin",
    });
    user = await createTestUser({
      name: "Feedback User",
      email: "feedback-user@test.com",
      role: "user",
    });

    const adminLogin = await loginTestUser(app, admin.email, admin.password);
    adminToken = adminLogin.accessToken;

    const userLogin = await loginTestUser(app, user.email, user.password);
    userToken = userLogin.accessToken;
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  const authHeaders = (token: string) => ({
    authorization: `Bearer ${token}`,
  });

  describe("POST /feedback", () => {
    it("should require authentication", async () => {
      const response = await request.post("/feedback", {
        type: "bug",
        title: "Something broke",
        description: "The button does not work when clicked repeatedly",
      });
      expect(response.statusCode).toBe(401);
    });

    it("should create a feedback as user", async () => {
      const response = await request.post(
        "/feedback",
        {
          type: "bug",
          title: "Login page error",
          description:
            "The login page shows a white screen after submitting the form",
        },
        { headers: authHeaders(userToken) },
      );

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.id).toBeDefined();
      expect(body.type).toBe("bug");
      expect(body.status).toBe("open");
      expect(body.priority).toBe("medium");
      expect(body.title).toBe("Login page error");
      expect(body.userId).toBe(user.id);
    });

    it("should create a feedback with metadata", async () => {
      const response = await request.post(
        "/feedback",
        {
          type: "feature_request",
          title: "Dark mode support",
          description:
            "It would be great to have a dark mode option in the settings",
          metadata: { browser: "Chrome", page: "/settings" },
        },
        { headers: authHeaders(userToken) },
      );

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.metadata).toEqual({ browser: "Chrome", page: "/settings" });
    });

    it("should validate required fields", async () => {
      const response = await request.post(
        "/feedback",
        { type: "bug" },
        { headers: authHeaders(userToken) },
      );
      expect(response.statusCode).toBe(400);
    });
  });

  describe("GET /feedback", () => {
    it("should list user's own feedbacks", async () => {
      const response = await request.get("/feedback", {
        headers: authHeaders(userToken),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data).toBeDefined();
      expect(body.meta).toBeDefined();
      expect(body.meta.page).toBe(1);

      // All results should belong to the user
      for (const fb of body.data) {
        expect(fb.userId).toBe(user.id);
      }
    });

    it("should list all feedbacks as admin", async () => {
      const response = await request.get("/feedback", {
        headers: authHeaders(adminToken),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.length).toBeGreaterThan(0);
    });

    it("should filter by type", async () => {
      const response = await request.get("/feedback?type=bug", {
        headers: authHeaders(adminToken),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      for (const fb of body.data) {
        expect(fb.type).toBe("bug");
      }
    });

    it("should filter by status", async () => {
      const response = await request.get("/feedback?status=open", {
        headers: authHeaders(adminToken),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      for (const fb of body.data) {
        expect(fb.status).toBe("open");
      }
    });
  });

  describe("GET /feedback/:id", () => {
    let feedbackId: string;

    beforeAll(async () => {
      const response = await request.post(
        "/feedback",
        {
          type: "improvement",
          title: "Better error messages",
          description:
            "Error messages should include more context about what went wrong",
        },
        { headers: authHeaders(userToken) },
      );
      feedbackId = response.json().id;
    });

    it("should return feedback detail with responses and votes", async () => {
      const response = await request.get(`/feedback/${feedbackId}`, {
        headers: authHeaders(userToken),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.id).toBe(feedbackId);
      expect(body.responses).toBeDefined();
      expect(Array.isArray(body.responses)).toBe(true);
      expect(body.voteCount).toBeTypeOf("number");
      expect(body.hasVoted).toBeTypeOf("boolean");
    });

    it("should return 404 for non-existent feedback", async () => {
      const response = await request.get(
        "/feedback/00000000-0000-0000-0000-000000000000",
        { headers: authHeaders(userToken) },
      );
      expect(response.statusCode).toBe(404);
    });
  });

  describe("PATCH /feedback/:id", () => {
    let feedbackId: string;

    beforeAll(async () => {
      const response = await request.post(
        "/feedback",
        {
          type: "bug",
          title: "Updatable feedback",
          description:
            "This feedback will be updated in tests to verify the update flow",
        },
        { headers: authHeaders(userToken) },
      );
      feedbackId = response.json().id;
    });

    it("should allow user to update title and description", async () => {
      const response = await request.patch(
        `/feedback/${feedbackId}`,
        { title: "Updated title" },
        { headers: authHeaders(userToken) },
      );

      expect(response.statusCode).toBe(200);
      expect(response.json().title).toBe("Updated title");
    });

    it("should prevent user from updating status", async () => {
      const response = await request.patch(
        `/feedback/${feedbackId}`,
        { status: "resolved" },
        { headers: authHeaders(userToken) },
      );

      expect(response.statusCode).toBe(403);
    });

    it("should allow admin to update status", async () => {
      const response = await request.patch(
        `/feedback/${feedbackId}`,
        { status: "under_review" },
        { headers: authHeaders(adminToken) },
      );

      expect(response.statusCode).toBe(200);
      expect(response.json().status).toBe("under_review");
    });

    it("should allow admin to set priority", async () => {
      const response = await request.patch(
        `/feedback/${feedbackId}`,
        { priority: "high" },
        { headers: authHeaders(adminToken) },
      );

      expect(response.statusCode).toBe(200);
      expect(response.json().priority).toBe("high");
    });

    it("should set resolvedAt when status changes to resolved", async () => {
      const response = await request.patch(
        `/feedback/${feedbackId}`,
        { status: "resolved" },
        { headers: authHeaders(adminToken) },
      );

      expect(response.statusCode).toBe(200);
      expect(response.json().resolvedAt).not.toBeNull();
    });
  });

  describe("POST /feedback/:id/responses", () => {
    let feedbackId: string;

    beforeAll(async () => {
      const response = await request.post(
        "/feedback",
        {
          type: "question",
          title: "How to reset password",
          description:
            "I cannot find the password reset option in the settings page",
        },
        { headers: authHeaders(userToken) },
      );
      feedbackId = response.json().id;
    });

    it("should add a public response", async () => {
      const response = await request.post(
        `/feedback/${feedbackId}/responses`,
        { message: "Thank you for the report!" },
        { headers: authHeaders(adminToken) },
      );

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.message).toBe("Thank you for the report!");
      expect(body.isInternal).toBe(false);
    });

    it("should allow admin to create internal note", async () => {
      const response = await request.post(
        `/feedback/${feedbackId}/responses`,
        { message: "Internal: needs investigation", isInternal: true },
        { headers: authHeaders(adminToken) },
      );

      expect(response.statusCode).toBe(201);
      expect(response.json().isInternal).toBe(true);
    });

    it("should prevent user from creating internal note", async () => {
      const response = await request.post(
        `/feedback/${feedbackId}/responses`,
        { message: "Trying to be internal", isInternal: true },
        { headers: authHeaders(userToken) },
      );

      expect(response.statusCode).toBe(403);
    });

    it("should allow user to create public response", async () => {
      const response = await request.post(
        `/feedback/${feedbackId}/responses`,
        { message: "Thanks for looking into this!" },
        { headers: authHeaders(userToken) },
      );

      expect(response.statusCode).toBe(201);
      expect(response.json().isInternal).toBe(false);
    });
  });

  describe("POST /feedback/:id/vote", () => {
    let feedbackId: string;

    beforeAll(async () => {
      const response = await request.post(
        "/feedback",
        {
          type: "feature_request",
          title: "Votable feature",
          description:
            "This feedback will receive votes during the voting test flow",
        },
        { headers: authHeaders(userToken) },
      );
      feedbackId = response.json().id;
    });

    it("should add a vote (toggle on)", async () => {
      const response = await request.post(
        `/feedback/${feedbackId}/vote`,
        {},
        { headers: authHeaders(userToken) },
      );

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.voted).toBe(true);
      expect(body.voteCount).toBe(1);
    });

    it("should remove a vote (toggle off)", async () => {
      const response = await request.post(
        `/feedback/${feedbackId}/vote`,
        {},
        { headers: authHeaders(userToken) },
      );

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.voted).toBe(false);
      expect(body.voteCount).toBe(0);
    });

    it("should allow multiple users to vote", async () => {
      // User votes
      await request.post(
        `/feedback/${feedbackId}/vote`,
        {},
        { headers: authHeaders(userToken) },
      );

      // Admin votes
      const response = await request.post(
        `/feedback/${feedbackId}/vote`,
        {},
        { headers: authHeaders(adminToken) },
      );

      expect(response.statusCode).toBe(200);
      expect(response.json().voteCount).toBe(2);
    });
  });

  describe("DELETE /feedback/:id", () => {
    it("should soft delete own feedback as user", async () => {
      const createResponse = await request.post(
        "/feedback",
        {
          type: "bug",
          title: "To be deleted",
          description: "This feedback will be deleted in the soft delete test",
        },
        { headers: authHeaders(userToken) },
      );
      const feedbackId = createResponse.json().id;

      const response = await request.delete(`/feedback/${feedbackId}`, {
        headers: authHeaders(userToken),
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().success).toBe(true);

      // Should not be findable anymore
      const getResponse = await request.get(`/feedback/${feedbackId}`, {
        headers: authHeaders(userToken),
      });
      expect(getResponse.statusCode).toBe(404);
    });

    it("should allow admin to delete any feedback", async () => {
      const createResponse = await request.post(
        "/feedback",
        {
          type: "bug",
          title: "Admin will delete",
          description: "This feedback created by user will be deleted by admin",
        },
        { headers: authHeaders(userToken) },
      );
      const feedbackId = createResponse.json().id;

      const response = await request.delete(`/feedback/${feedbackId}`, {
        headers: authHeaders(adminToken),
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe("GET /feedback/stats", () => {
    it("should return stats for admin", async () => {
      const response = await request.get("/feedback/stats", {
        headers: authHeaders(adminToken),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.byType).toBeDefined();
      expect(body.byStatus).toBeDefined();
      expect(body.total).toBeTypeOf("number");
    });

    it("should deny access to non-admin", async () => {
      const response = await request.get("/feedback/stats", {
        headers: authHeaders(userToken),
      });

      expect(response.statusCode).toBe(403);
    });
  });
});
