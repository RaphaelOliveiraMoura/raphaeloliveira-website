export function getSecurityHeaders(): Record<string, string> {
  const isDev = process.env.NODE_ENV === "development";

  const connectSrc = process.env.NEXT_PUBLIC_API_URL
    ? `'self' ${process.env.NEXT_PUBLIC_API_URL}`
    : "'self'";

  const csp = [
    "default-src 'self'",
    isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    `connect-src ${connectSrc}`,
    "frame-ancestors 'none'",
  ].join("; ");

  return {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy": csp,
  };
}
