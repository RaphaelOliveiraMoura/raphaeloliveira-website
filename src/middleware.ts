import createMiddleware from "next-intl/middleware";

import { getSecurityHeaders } from "@/lib/security/headers";

import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(
  request: Parameters<typeof intlMiddleware>[0],
) {
  const response = intlMiddleware(request);

  const headers = getSecurityHeaders();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/(pt-BR|en|es)/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
