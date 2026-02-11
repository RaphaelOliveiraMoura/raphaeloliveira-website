import { isClient } from "@/lib/utils/environment";

const TOKEN_KEY = "core-stack-access-token";

/**
 * Gerenciador de tokens de acesso em memoria e sessionStorage.
 * Usar para integrar com o AuthProvider.
 */
export const tokenManager = {
  _token: null as string | null,

  get(): string | null {
    if (this._token) return this._token;
    if (!isClient()) return null;
    const stored = sessionStorage.getItem(TOKEN_KEY);
    if (stored) this._token = stored;
    return this._token;
  },

  set(token: string): void {
    this._token = token;
    if (isClient()) {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  },

  clear(): void {
    this._token = null;
    if (isClient()) {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  },

  getAuthHeader(): Record<string, string> {
    const token = this.get();
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  },
};
