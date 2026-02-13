import { randomUUID } from "node:crypto";

import { db } from "../../src/db/index";
import {
  auditLogs,
  emailVerificationTokens,
  passwordResetTokens,
  refreshTokens,
  uploads,
  users,
} from "../../src/db/schema/index";
import { hashPassword } from "../../src/lib/hash";

export interface TestUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  password: string; // Plain-text password for test assertions
}

/**
 * Create a test user in the database.
 */
export async function createTestUser(
  overrides: Partial<{
    name: string;
    email: string;
    role: "admin" | "user";
    password: string;
  }> = {},
): Promise<TestUser> {
  const password = overrides.password ?? "password123";
  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values({
      name: overrides.name ?? "Test User",
      email: overrides.email ?? `test-${randomUUID()}@example.com`,
      passwordHash,
      role: overrides.role ?? "user",
    })
    .returning();

  return {
    id: user!.id,
    name: user!.name,
    email: user!.email,
    role: user!.role,
    password,
  };
}

/**
 * Login a test user and return the access token.
 */
export async function loginTestUser(
  app: import("fastify").FastifyInstance,
  email: string,
  password: string,
): Promise<{ accessToken: string; cookies: string }> {
  const response = await app.inject({
    method: "POST",
    url: "/auth/login",
    payload: { email, password },
    headers: { "content-type": "application/json" },
  });

  const body = response.json();
  const cookies = response.headers["set-cookie"];
  const cookieStr = Array.isArray(cookies)
    ? cookies.join("; ")
    : String(cookies ?? "");

  return {
    accessToken: body.accessToken,
    cookies: cookieStr,
  };
}

/**
 * Clean up all test data. Call in afterAll/afterEach.
 * Order matters due to foreign key constraints.
 */
export async function cleanupTestData(): Promise<void> {
  await db.delete(auditLogs);
  await db.delete(uploads);
  await db.delete(emailVerificationTokens);
  await db.delete(passwordResetTokens);
  await db.delete(refreshTokens);
  await db.delete(users);
}
