import { createReadStream } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { FastifyInstance } from "fastify";
import FormData from "form-data";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  cleanupTestData,
  createTestUser,
  loginTestUser,
} from "../helpers/factories";
import { createTestServer } from "../helpers/test-server";

describe("Uploads routes", () => {
  let app: FastifyInstance;
  let userToken: string;
  const tmpDir = join(process.cwd(), "test-tmp-fixtures");

  beforeAll(async () => {
    app = await createTestServer();
    await mkdir(tmpDir, { recursive: true });
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
    await rm(tmpDir, { recursive: true, force: true });
  });

  beforeEach(async () => {
    await cleanupTestData();

    const user = await createTestUser({
      email: "uploader@test.com",
      role: "user",
    });
    const { accessToken } = await loginTestUser(app, user.email, user.password);
    userToken = accessToken;
  });

  const authHeaders = () => ({
    authorization: `Bearer ${userToken}`,
  });

  describe("POST /uploads", () => {
    it("should upload a file", async () => {
      const filePath = join(tmpDir, "test.txt");
      await writeFile(filePath, "Hello World");

      const form = new FormData();
      form.append("file", createReadStream(filePath), {
        filename: "test.txt",
        contentType: "text/csv",
      });

      const response = await app.inject({
        method: "POST",
        url: "/uploads",
        headers: {
          ...authHeaders(),
          ...form.getHeaders(),
        },
        payload: form,
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.originalName).toBe("test.txt");
      expect(body.contentType).toBe("text/csv");
      expect(body.id).toBeDefined();
      expect(body.key).toContain("uploads/");
    });

    it("should reject disallowed MIME types", async () => {
      const filePath = join(tmpDir, "test.exe");
      await writeFile(filePath, "binary content");

      const form = new FormData();
      form.append("file", createReadStream(filePath), {
        filename: "test.exe",
        contentType: "application/x-msdownload",
      });

      const response = await app.inject({
        method: "POST",
        url: "/uploads",
        headers: {
          ...authHeaders(),
          ...form.getHeaders(),
        },
        payload: form,
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject unauthenticated uploads", async () => {
      const form = new FormData();
      form.append("file", Buffer.from("test"), {
        filename: "test.txt",
        contentType: "text/csv",
      });

      const response = await app.inject({
        method: "POST",
        url: "/uploads",
        headers: form.getHeaders(),
        payload: form,
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /uploads", () => {
    it("should list uploads with pagination", async () => {
      // Upload a file first
      const form = new FormData();
      form.append("file", Buffer.from("content"), {
        filename: "listed.csv",
        contentType: "text/csv",
      });

      await app.inject({
        method: "POST",
        url: "/uploads",
        headers: { ...authHeaders(), ...form.getHeaders() },
        payload: form,
      });

      const response = await app.inject({
        method: "GET",
        url: "/uploads",
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data).toBeDefined();
      expect(body.meta).toBeDefined();
      expect(body.data.length).toBeGreaterThan(0);
    });

    it("should require authentication", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/uploads",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /uploads/:id", () => {
    it("should return upload metadata", async () => {
      const form = new FormData();
      form.append("file", Buffer.from("get-by-id"), {
        filename: "getme.csv",
        contentType: "text/csv",
      });

      const uploadRes = await app.inject({
        method: "POST",
        url: "/uploads",
        headers: { ...authHeaders(), ...form.getHeaders() },
        payload: form,
      });

      const upload = uploadRes.json();

      const response = await app.inject({
        method: "GET",
        url: `/uploads/${upload.id}`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.id).toBe(upload.id);
      expect(body.originalName).toBe("getme.csv");
    });

    it("should return 404 for non-existent upload", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/uploads/00000000-0000-0000-0000-000000000000",
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe("DELETE /uploads/:id", () => {
    it("should delete an upload", async () => {
      const form = new FormData();
      form.append("file", Buffer.from("to-delete"), {
        filename: "deleteme.csv",
        contentType: "text/csv",
      });

      const uploadRes = await app.inject({
        method: "POST",
        url: "/uploads",
        headers: { ...authHeaders(), ...form.getHeaders() },
        payload: form,
      });

      const upload = uploadRes.json();

      const deleteRes = await app.inject({
        method: "DELETE",
        url: `/uploads/${upload.id}`,
        headers: authHeaders(),
      });

      expect(deleteRes.statusCode).toBe(200);
      expect(deleteRes.json().success).toBe(true);

      // Verify it's gone
      const getRes = await app.inject({
        method: "GET",
        url: `/uploads/${upload.id}`,
        headers: authHeaders(),
      });
      expect(getRes.statusCode).toBe(404);
    });
  });
});
