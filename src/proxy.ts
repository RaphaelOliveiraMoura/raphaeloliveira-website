import createIntlMiddleware from "next-intl/middleware";

import { createAuthMiddleware } from "@/lib/auth/middleware";
import { getSecurityHeaders } from "@/lib/security/headers";

import { locales } from "@/config/i18n";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const authMiddleware = createAuthMiddleware(
  {
    protectedRoutes: ["/dashboard", "/dashboard/*", "/settings", "/settings/*"],
    publicRoutes: ["/login", "/register", "/forgot-password"],
    loginPath: "/login",
    defaultAuthenticatedPath: "/dashboard",
  },
  [...locales],
);

export default function proxy(request: Parameters<typeof intlMiddleware>[0]) {
  const response = intlMiddleware(request);

  // Security headers
  const headers = getSecurityHeaders();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  // Auth guards
  return authMiddleware(request, response);
}

export const config = {
  matcher: [
    "/",
    "/(pt-BR|en|es)/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
