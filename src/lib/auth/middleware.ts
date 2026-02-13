import { type NextRequest, NextResponse } from "next/server";

export interface AuthMiddlewareConfig {
  /** Rotas que requerem autenticacao (suporta wildcards simples) */
  protectedRoutes: string[];
  /** Rotas publicas (override de protectedRoutes) */
  publicRoutes?: string[];
  /** Rota de login para redirect (default: /login) */
  loginPath?: string;
  /** Rota padrao apos login (default: /dashboard) */
  defaultAuthenticatedPath?: string;
  /** Nome do cookie de sessao/refresh token (default: refresh-token) */
  sessionCookieName?: string;
}

const DEFAULT_CONFIG: Required<AuthMiddlewareConfig> = {
  protectedRoutes: ["/dashboard", "/dashboard/*", "/settings", "/settings/*"],
  publicRoutes: ["/login", "/register", "/forgot-password"],
  loginPath: "/login",
  defaultAuthenticatedPath: "/dashboard",
  sessionCookieName: "refresh-token",
};

function matchesPattern(pathname: string, pattern: string): boolean {
  if (pattern.endsWith("/*")) {
    const base = pattern.slice(0, -2);
    return pathname === base || pathname.startsWith(`${base}/`);
  }
  return pathname === pattern;
}

function stripLocale(pathname: string, locales: string[]): string {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return pathname.slice(`/${locale}`.length) || "/";
    }
  }
  return pathname;
}

/**
 * Cria um middleware de autenticacao que verifica se o usuario
 * possui um cookie de sessao valido. Integra com o middleware de i18n.
 */
export function createAuthMiddleware(
  config: Partial<AuthMiddlewareConfig> = {},
  locales: string[] = [],
) {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  return function authMiddleware(
    request: NextRequest,
    response: NextResponse,
  ): NextResponse {
    const pathname = stripLocale(request.nextUrl.pathname, locales);
    const hasSession = request.cookies.has(cfg.sessionCookieName);

    const isProtected = cfg.protectedRoutes.some((p) =>
      matchesPattern(pathname, p),
    );
    const isPublic = cfg.publicRoutes.some((p) => matchesPattern(pathname, p));

    // Rota protegida sem sessao → redirect para login
    if (isProtected && !isPublic && !hasSession) {
      const loginUrl = new URL(cfg.loginPath, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Pagina de login com sessao → redirect para dashboard
    if (pathname === cfg.loginPath && hasSession) {
      const dashUrl = new URL(cfg.defaultAuthenticatedPath, request.url);
      return NextResponse.redirect(dashUrl);
    }

    return response;
  };
}
