import type { createApiClient } from "./client";

export function setupAuthInterceptors(
  client: ReturnType<typeof createApiClient>,
  getToken: () => string | null,
  refreshToken: () => Promise<string | null>
) {
  client.addRequestInterceptor((config) => {
    const token = getToken();
    if (token) {
      return {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        },
      };
    }
    return config;
  });

  client.addResponseInterceptor(async (response, data) => {
    if (response.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        // O token foi renovado. O retry da request original
        // deve ser feito pelo caller (React Query retry).
        return data;
      }
    }
    return data;
  });
}
