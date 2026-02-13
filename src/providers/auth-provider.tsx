"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { apiClient } from "@/lib/api";
import { setupAuthInterceptors } from "@/lib/api/auth-interceptor";
import type { SocialProvider } from "@/lib/auth/social-login";
import { tokenManager } from "@/lib/auth/token";

import type { AuthLoginResponse, AuthTokenResponse, User } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  socialLogin: (idToken: string, provider: SocialProvider) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// Auth routes via proxy Next.js (mesma origin, para cookie handling)
const AUTH_ME_URL = "/api/auth/me";
const AUTH_LOGIN_URL = "/api/auth/login";
const AUTH_LOGOUT_URL = "/api/auth/logout";
const AUTH_REFRESH_URL = "/api/auth/refresh";
const AUTH_REGISTER_URL = "/api/auth/register";
const AUTH_SOCIAL_URL = "/api/auth/social";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Chama o proxy de refresh e retorna o novo access token.
   * O refresh-token cookie e enviado automaticamente pelo browser.
   */
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(AUTH_REFRESH_URL, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return null;
      const data = (await res.json()) as AuthTokenResponse;
      if (data.accessToken) tokenManager.set(data.accessToken);
      return data.accessToken ?? null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    // Configurar auth interceptors do apiClient (idempotente a nivel do modulo)
    setupAuthInterceptors(apiClient, {
      getToken: () => tokenManager.get(),
      refreshToken: refreshAccessToken,
      onRefreshFailure: () => {
        tokenManager.clear();
        setUser(null);
      },
    });

    // Registrar handler de refresh para auto-refresh proativo
    tokenManager.setRefreshHandler(refreshAccessToken);

    let cancelled = false;

    async function checkSession() {
      try {
        let token = tokenManager.get();

        // Sem token em memoria (nova aba, refresh de pagina) → tentar refresh via cookie
        if (!token || tokenManager.isExpired(token)) {
          token = await refreshAccessToken();
        }

        if (cancelled) return;
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Buscar dados do usuario via proxy /api/auth/me
        const res = await fetch(AUTH_ME_URL, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (cancelled) return;
        if (res.ok) {
          const data = (await res.json()) as User;
          setUser(data);
        } else {
          tokenManager.clear();
          setUser(null);
        }
      } catch {
        if (!cancelled) {
          tokenManager.clear();
          setUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    checkSession();
    return () => {
      cancelled = true;
    };
  }, [refreshAccessToken]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(AUTH_LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Login failed");
    const data = (await res.json()) as AuthLoginResponse;
    if (data.accessToken) tokenManager.set(data.accessToken);
    setUser(data.user);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await fetch(AUTH_REGISTER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(data.message ?? "Registration failed");
      }
      const data = (await res.json()) as AuthLoginResponse;
      if (data.accessToken) tokenManager.set(data.accessToken);
      setUser(data.user);
    },
    [],
  );

  const socialLogin = useCallback(
    async (idToken: string, provider: SocialProvider) => {
      const res = await fetch(AUTH_SOCIAL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken, provider }),
      });
      if (!res.ok) throw new Error("Social login failed");
      const data = (await res.json()) as AuthLoginResponse;
      if (data.accessToken) tokenManager.set(data.accessToken);
      setUser(data.user);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await fetch(AUTH_LOGOUT_URL, { method: "POST", credentials: "include" });
    } finally {
      tokenManager.clear();
      setUser(null);
    }
  }, []);

  const setUserState = useCallback((u: User | null) => {
    setUser(u);
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    socialLogin,
    logout,
    setUser: setUserState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
