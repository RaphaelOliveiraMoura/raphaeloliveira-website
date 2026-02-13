import { randomUUID } from "node:crypto";

import { db } from "../../src/db/index.js";
import { refreshTokens, users } from "../../src/db/schema/index.js";
import { hashPassword } from "../../src/lib/hash.js";

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
 * Clean up all test data. Call in afterAll/afterEach.
 */
export async function cleanupTestData(): Promise<void> {
  await db.delete(refreshTokens);
  await db.delete(users);
}
