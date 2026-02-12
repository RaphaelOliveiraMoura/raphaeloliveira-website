"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { tokenManager } from "@/lib/auth/token";

import type { User } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

const AUTH_ME_URL = "/api/auth/me";
const AUTH_LOGIN_URL = "/api/auth/login";
const AUTH_LOGOUT_URL = "/api/auth/logout";
const AUTH_REFRESH_URL = "/api/auth/refresh";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(AUTH_REFRESH_URL, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return null;
      const data = (await res.json()) as {
        token?: string;
        accessToken?: string;
      };
      const token = data.token ?? data.accessToken ?? null;
      if (token) tokenManager.set(token);
      return token;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    // Registrar handler de refresh para auto-refresh proativo
    tokenManager.setRefreshHandler(refreshAccessToken);

    let cancelled = false;

    async function checkSession() {
      try {
        let token = tokenManager.get();

        // Se token expirado ou ausente, tentar refresh
        if (!token || tokenManager.isExpired(token)) {
          token = await refreshAccessToken();
        }

        if (cancelled) return;
        if (!token) {
          setIsLoading(false);
          return;
        }

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
    const data = (await res.json()) as {
      user: User;
      token?: string;
      accessToken?: string;
    };
    const token = data.token ?? data.accessToken ?? null;
    if (token) tokenManager.set(token);
    setUser(data.user);
  }, []);

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
    logout,
    setUser: setUserState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
