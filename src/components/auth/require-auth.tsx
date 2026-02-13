"use client";

import { useEffect, useRef } from "react";

import { usePathname } from "@/lib/i18n";

import { useAuth } from "@/providers/auth-provider";

interface RequireAuthProps {
  children: React.ReactNode;
  /** Componente exibido enquanto verifica a sessao ou redireciona */
  fallback?: React.ReactNode;
}

const LoadingSpinner = (
  <div className="flex min-h-screen items-center justify-center">
    <div
      className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary"
      role="status"
    />
  </div>
);

/**
 * Guard de autenticacao client-side.
 * Redireciona para /login quando o usuario nao esta autenticado.
 * Deve ser usado dentro de um AuthProvider.
 */
export function RequireAuth({ children, fallback }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname(); // locale-free (via next-intl)
  const redirecting = useRef(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !redirecting.current) {
      redirecting.current = true;
      const callbackUrl = encodeURIComponent(pathname);
      // Limpar o cookie refresh-token (httpOnly) via endpoint de logout
      // antes de redirecionar, para evitar loop com o proxy
      fetch("/api/auth/logout", { method: "POST", credentials: "include" })
        .catch(() => {})
        .finally(() => {
          window.location.href = `/login?callbackUrl=${callbackUrl}`;
        });
    }
  }, [isLoading, isAuthenticated, pathname]);

  if (isLoading || !isAuthenticated) {
    return fallback ?? LoadingSpinner;
  }

  return <>{children}</>;
}
