import { getSecurityHeaders } from "@/lib/security/headers";

describe("getSecurityHeaders", () => {
  it("returns required security headers", () => {
    const headers = getSecurityHeaders();

    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Permissions-Policy"]).toBeDefined();
    expect(headers["Content-Security-Policy"]).toBeDefined();
  });

  it("CSP includes self as default-src", () => {
    const headers = getSecurityHeaders();
    expect(headers["Content-Security-Policy"]).toContain("default-src 'self'");
  });

  it("CSP includes nonce when provided", () => {
    const nonce = "test-nonce-123";
    const headers = getSecurityHeaders(nonce);
    expect(headers["Content-Security-Policy"]).toContain(`'nonce-${nonce}'`);
    expect(headers["Content-Security-Policy"]).toContain("'strict-dynamic'");
  });

  it("CSP uses unsafe-inline as fallback without nonce in production mode", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const headers = getSecurityHeaders();
    expect(headers["Content-Security-Policy"]).toContain("'unsafe-inline'");

    process.env.NODE_ENV = originalEnv;
  });
});
