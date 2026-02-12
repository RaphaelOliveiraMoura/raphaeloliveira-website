import { describe, expect, it } from "vitest";

import {
  getUserPermissions,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from "@/lib/auth/permissions";

describe("hasPermission", () => {
  it("returns true for admin with any permission", () => {
    expect(hasPermission("admin", "users:delete")).toBe(true);
    expect(hasPermission("admin", "settings:update")).toBe(true);
  });

  it("returns false for user with write permissions", () => {
    expect(hasPermission("user", "users:create")).toBe(false);
    expect(hasPermission("user", "posts:create")).toBe(false);
  });

  it("returns true for user with read permissions", () => {
    expect(hasPermission("user", "users:read")).toBe(true);
    expect(hasPermission("user", "posts:read")).toBe(true);
  });

  it("returns correct permissions for editor", () => {
    expect(hasPermission("editor", "posts:create")).toBe(true);
    expect(hasPermission("editor", "posts:delete")).toBe(false);
    expect(hasPermission("editor", "users:delete")).toBe(false);
  });
});

describe("hasAllPermissions", () => {
  it("returns true when all permissions are present", () => {
    expect(hasAllPermissions("admin", ["users:read", "users:create"])).toBe(
      true,
    );
  });

  it("returns false when any permission is missing", () => {
    expect(hasAllPermissions("editor", ["posts:create", "posts:delete"])).toBe(
      false,
    );
  });
});

describe("hasAnyPermission", () => {
  it("returns true when at least one permission matches", () => {
    expect(hasAnyPermission("user", ["users:read", "users:delete"])).toBe(true);
  });

  it("returns false when no permissions match", () => {
    expect(hasAnyPermission("user", ["users:create", "users:delete"])).toBe(
      false,
    );
  });
});

describe("getUserPermissions", () => {
  it("returns permissions for authenticated user", () => {
    const perms = getUserPermissions({
      id: "1",
      name: "Test",
      email: "test@test.com",
      role: "admin",
    });
    expect(perms).toContain("users:delete");
    expect(perms.length).toBeGreaterThan(0);
  });

  it("returns empty array for null user", () => {
    expect(getUserPermissions(null)).toEqual([]);
  });
});
