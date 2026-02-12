import { describe, expect, it } from "vitest";
import { NextRequest, NextResponse } from "next/server";

import { createAuthMiddleware } from "@/lib/auth/middleware";

function createRequest(url: string, cookies: Record<string, string> = {}) {
  const req = new NextRequest(new URL(url, "http://localhost:3000"));
  for (const [name, value] of Object.entries(cookies)) {
    req.cookies.set(name, value);
  }
  return req;
}

describe("createAuthMiddleware", () => {
  const authMiddleware = createAuthMiddleware(
    {
      protectedRoutes: ["/dashboard", "/dashboard/*"],
      publicRoutes: ["/login"],
      loginPath: "/login",
      defaultAuthenticatedPath: "/dashboard",
      sessionCookieName: "refresh-token",
    },
    ["pt-BR", "en", "es"],
  );

  it("redirects to login when accessing protected route without session", () => {
    const req = createRequest("http://localhost:3000/dashboard");
    const response = NextResponse.next();
    const result = authMiddleware(req, response);

    expect(result.status).toBe(307);
    expect(result.headers.get("location")).toContain("/login");
    expect(result.headers.get("location")).toContain("callbackUrl");
  });

  it("allows access to protected route with session cookie", () => {
    const req = createRequest("http://localhost:3000/dashboard", {
      "refresh-token": "valid-token",
    });
    const response = NextResponse.next();
    const result = authMiddleware(req, response);

    expect(result.status).not.toBe(307);
  });

  it("redirects authenticated users away from login page", () => {
    const req = createRequest("http://localhost:3000/login", {
      "refresh-token": "valid-token",
    });
    const response = NextResponse.next();
    const result = authMiddleware(req, response);

    expect(result.status).toBe(307);
    expect(result.headers.get("location")).toContain("/dashboard");
  });

  it("allows unauthenticated access to public routes", () => {
    const req = createRequest("http://localhost:3000/login");
    const response = NextResponse.next();
    const result = authMiddleware(req, response);

    expect(result.status).not.toBe(307);
  });

  it("strips locale prefix when checking routes", () => {
    const req = createRequest("http://localhost:3000/en/dashboard");
    const response = NextResponse.next();
    const result = authMiddleware(req, response);

    expect(result.status).toBe(307);
    expect(result.headers.get("location")).toContain("/login");
  });

  it("matches wildcard patterns", () => {
    const req = createRequest(
      "http://localhost:3000/dashboard/settings/profile",
    );
    const response = NextResponse.next();
    const result = authMiddleware(req, response);

    expect(result.status).toBe(307);
  });

  it("does not redirect non-protected routes", () => {
    const req = createRequest("http://localhost:3000/about");
    const response = NextResponse.next();
    const result = authMiddleware(req, response);

    expect(result.status).not.toBe(307);
  });
});
