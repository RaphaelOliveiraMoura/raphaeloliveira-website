export function getSecurityHeaders(nonce?: string): Record<string, string> {
  const isDev = process.env.NODE_ENV === "development";

  const connectSrc = process.env.NEXT_PUBLIC_API_URL
    ? `'self' ${process.env.NEXT_PUBLIC_API_URL}`
    : "'self'";

  // Em produção, usa nonce para scripts inline (Next.js injeta automaticamente)
  // Em dev, mantém unsafe-inline/unsafe-eval para hot reload
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : nonce
      ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
      : "script-src 'self' 'unsafe-inline'";

  const csp = [
    "default-src 'self'",
    scriptSrc,
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
