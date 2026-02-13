import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { db } from "../../src/db/index";
import { settings } from "../../src/db/schema/index";
import {
  cleanupTestData,
  createTestUser,
  loginTestUser,
} from "../helpers/factories";
import { createTestServer, injectRequest } from "../helpers/test-server";

describe("Settings routes", () => {
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
      email: "admin-settings@test.com",
      role: "admin",
    });
    const { accessToken } = await loginTestUser(
      app,
      admin.email,
      admin.password,
    );
    return accessToken;
  }

  describe("PUT /settings", () => {
    it("should update user settings", async () => {
      const user = await createTestUser({ email: "settings@test.com" });
      const { accessToken } = await loginTestUser(
        app,
        user.email,
        user.password,
      );

      const response = await request.put(
        "/settings",
        [
          { key: "theme", value: "dark" },
          { key: "language", value: "pt-BR" },
        ],
        authHeaders(accessToken),
      );

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.json())).toBe(true);
    });
  });

  describe("GET /settings", () => {
    it("should get user settings merged with system defaults", async () => {
      const user = await createTestUser({ email: "getsettings@test.com" });
      const { accessToken } = await loginTestUser(
        app,
        user.email,
        user.password,
      );

      // Create a system setting directly
      await db.insert(settings).values({
        scope: "system",
        key: "default-theme",
        value: JSON.stringify("light"),
      });

      // Create a user setting
      await request.put(
        "/settings",
        [{ key: "language", value: "en" }],
        authHeaders(accessToken),
      );

      const response = await request.get("/settings", authHeaders(accessToken));

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it("should require authentication", async () => {
      const response = await request.get("/settings");
      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /settings/system", () => {
    it("should list system settings (admin only)", async () => {
      const token = await loginAdmin();

      const response = await request.get(
        "/settings/system",
        authHeaders(token),
      );

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.json())).toBe(true);
    });

    it("should reject non-admin users", async () => {
      const user = await createTestUser({ email: "nonsys@test.com" });
      const { accessToken } = await loginTestUser(
        app,
        user.email,
        user.password,
      );

      const response = await request.get(
        "/settings/system",
        authHeaders(accessToken),
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe("PUT /settings/system", () => {
    it("should update system settings (admin only)", async () => {
      const token = await loginAdmin();

      const response = await request.put(
        "/settings/system",
        [
          { key: "site-name", value: "My App" },
          { key: "maintenance-mode", value: false },
        ],
        authHeaders(token),
      );

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.json())).toBe(true);

      // Verify they were saved
      const getResp = await request.get("/settings/system", authHeaders(token));
      const data = getResp.json();
      const siteName = data.find((s: { key: string }) => s.key === "site-name");
      expect(siteName).toBeDefined();
    });
  });
});
