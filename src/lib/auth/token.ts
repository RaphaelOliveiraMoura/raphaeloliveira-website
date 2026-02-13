const REFRESH_BUFFER_MS = 60_000; // Renovar 60s antes de expirar

interface TokenPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: unknown;
}

/**
 * Decodifica o payload de um JWT sem verificar a assinatura.
 * Util para ler expiracao no client-side.
 */
function decodeJwtPayload(token: string): TokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1] as string;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Gerenciador de tokens de acesso in-memory.
 * O access token vive apenas em memoria (variavel JS) -- nao persiste em storage.
 * Nova aba ou refresh de pagina reobtem o token via refresh-token cookie.
 */
export const tokenManager = {
  _token: null as string | null,
  _refreshTimer: null as ReturnType<typeof setTimeout> | null,
  _refreshFn: null as (() => Promise<string | null>) | null,

  get(): string | null {
    return this._token;
  },

  set(token: string): void {
    this._token = token;
    this._scheduleRefresh(token);
  },

  clear(): void {
    this._token = null;
    this._clearRefreshTimer();
  },

  getAuthHeader(): Record<string, string> {
    const token = this.get();
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  },

  /**
   * Decodifica o payload do token atual (sem verificar assinatura).
   */
  getPayload(): TokenPayload | null {
    const token = this.get();
    if (!token) return null;
    return decodeJwtPayload(token);
  },

  /**
   * Verifica se um token esta expirado.
   */
  isExpired(token?: string): boolean {
    const t = token ?? this._token;
    if (!t) return true;
    const payload = decodeJwtPayload(t);
    if (!payload?.exp) return false; // Sem exp = nao expira
    return Date.now() >= payload.exp * 1000;
  },

  /**
   * Retorna ms ate a expiracao do token. -1 se nao tem exp.
   */
  getTimeToExpiry(): number {
    const payload = this.getPayload();
    if (!payload?.exp) return -1;
    return payload.exp * 1000 - Date.now();
  },

  /**
   * Registra a funcao de refresh para auto-refresh proativo.
   */
  setRefreshHandler(fn: () => Promise<string | null>): void {
    this._refreshFn = fn;
    const token = this.get();
    if (token) this._scheduleRefresh(token);
  },

  _scheduleRefresh(token: string): void {
    this._clearRefreshTimer();
    if (!this._refreshFn) return;

    const payload = decodeJwtPayload(token);
    if (!payload?.exp) return;

    const expiresIn = payload.exp * 1000 - Date.now();
    const refreshIn = expiresIn - REFRESH_BUFFER_MS;

    if (refreshIn <= 0) {
      void this._doRefresh();
      return;
    }

    this._refreshTimer = setTimeout(() => {
      void this._doRefresh();
    }, refreshIn);
  },

  async _doRefresh(): Promise<void> {
    if (!this._refreshFn) return;
    try {
      const newToken = await this._refreshFn();
      if (newToken) {
        this.set(newToken);
      } else {
        this.clear();
      }
    } catch {
      this.clear();
    }
  },

  _clearRefreshTimer(): void {
    if (this._refreshTimer) {
      clearTimeout(this._refreshTimer);
      this._refreshTimer = null;
    }
  },
};
