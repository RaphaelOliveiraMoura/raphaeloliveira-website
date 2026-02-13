import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { tokenManager } from "@/lib/auth/token";

// Helper para criar JWT falso com payload
function createFakeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  const sig = btoa("fake-signature");
  return `${header}.${body}.${sig}`;
}

describe("tokenManager", () => {
  beforeEach(() => {
    tokenManager.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when no token is stored", () => {
    expect(tokenManager.get()).toBeNull();
  });

  it("stores and retrieves a token in memory", () => {
    const token = createFakeJwt({
      sub: "user1",
      exp: Date.now() / 1000 + 3600,
    });
    tokenManager.set(token);
    expect(tokenManager.get()).toBe(token);
  });

  it("clears the token from memory", () => {
    tokenManager.set(createFakeJwt({ sub: "1" }));
    tokenManager.clear();
    expect(tokenManager.get()).toBeNull();
  });

  it("returns auth header with token", () => {
    const token = createFakeJwt({ sub: "1" });
    tokenManager.set(token);
    expect(tokenManager.getAuthHeader()).toEqual({
      Authorization: `Bearer ${token}`,
    });
  });

  it("returns empty auth header without token", () => {
    expect(tokenManager.getAuthHeader()).toEqual({});
  });

  it("decodes JWT payload", () => {
    const token = createFakeJwt({ sub: "user123", role: "admin" });
    tokenManager.set(token);
    const payload = tokenManager.getPayload();
    expect(payload?.sub).toBe("user123");
    expect(payload?.role).toBe("admin");
  });

  it("detects expired tokens", () => {
    const expiredToken = createFakeJwt({ exp: Date.now() / 1000 - 100 });
    expect(tokenManager.isExpired(expiredToken)).toBe(true);
  });

  it("detects valid tokens", () => {
    const validToken = createFakeJwt({ exp: Date.now() / 1000 + 3600 });
    expect(tokenManager.isExpired(validToken)).toBe(false);
  });

  it("returns -1 for time to expiry when no exp claim", () => {
    tokenManager.set(createFakeJwt({ sub: "1" }));
    expect(tokenManager.getTimeToExpiry()).toBe(-1);
  });

  it("returns positive time to expiry for valid token", () => {
    const futureExp = Date.now() / 1000 + 3600;
    tokenManager.set(createFakeJwt({ exp: futureExp }));
    expect(tokenManager.getTimeToExpiry()).toBeGreaterThan(0);
  });

  it("does not persist to sessionStorage (in-memory only)", () => {
    const token = createFakeJwt({ sub: "1" });
    tokenManager.set(token);
    expect(sessionStorage.getItem("core-stack-access-token")).toBeNull();
  });

  it("returns null after clear even if set was called before", () => {
    tokenManager.set(
      createFakeJwt({ sub: "1", exp: Date.now() / 1000 + 3600 }),
    );
    tokenManager.clear();
    expect(tokenManager.get()).toBeNull();
    expect(tokenManager.getPayload()).toBeNull();
  });
});
