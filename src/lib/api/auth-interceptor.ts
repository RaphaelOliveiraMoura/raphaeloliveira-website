import type { createApiClient } from "./client";

interface AuthConfig {
  getToken: () => string | null;
  refreshToken: () => Promise<string | null>;
  onRefreshFailure?: () => void;
}

let authConfig: AuthConfig | null = null;
let refreshPromise: Promise<string | null> | null = null;
let interceptorsConfigured = false;

/**
 * Executa refresh com mutex: se um refresh ja esta em andamento,
 * novas chamadas aguardam o mesmo Promise em vez de disparar
 * multiplas requests concorrentes (evita race condition com token rotation).
 */
export async function refreshWithMutex(): Promise<string | null> {
  if (!authConfig) return null;

  if (refreshPromise) return refreshPromise;

  refreshPromise = authConfig.refreshToken();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

/**
 * Notifica que o refresh falhou (ex: sessao expirada).
 */
export function notifyRefreshFailure(): void {
  authConfig?.onRefreshFailure?.();
}

/**
 * Configura o auth no apiClient:
 * - Request interceptor que injeta Authorization header
 * - Armazena config para uso pelo retry de 401 no request()
 *
 * Idempotente: o interceptor e adicionado apenas na primeira chamada.
 * Chamadas subsequentes atualizam o authConfig sem duplicar interceptors.
 */
export function setupAuthInterceptors(
  client: ReturnType<typeof createApiClient>,
  config: AuthConfig,
) {
  authConfig = config;

  if (interceptorsConfigured) return;
  interceptorsConfigured = true;

  client.addRequestInterceptor((requestConfig) => {
    const token = authConfig?.getToken() ?? null;
    if (token) {
      return {
        ...requestConfig,
        headers: {
          ...requestConfig.headers,
          Authorization: `Bearer ${token}`,
        },
      };
    }
    return requestConfig;
  });
}
