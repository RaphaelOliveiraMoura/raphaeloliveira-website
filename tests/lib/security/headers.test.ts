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
});
