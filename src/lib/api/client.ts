import type {
  ApiResponse,
  RequestInterceptor,
  ResponseInterceptor,
} from "./types";

export function createApiClient(baseUrl: string) {
  const requestInterceptors: RequestInterceptor[] = [];
  const responseInterceptors: ResponseInterceptor[] = [];

  const addRequestInterceptor = (fn: RequestInterceptor) => {
    requestInterceptors.push(fn);
    return () => {
      const idx = requestInterceptors.indexOf(fn);
      if (idx >= 0) requestInterceptors.splice(idx, 1);
    };
  };

  const addResponseInterceptor = (fn: ResponseInterceptor) => {
    responseInterceptors.push(fn);
    return () => {
      const idx = responseInterceptors.indexOf(fn);
      if (idx >= 0) responseInterceptors.splice(idx, 1);
    };
  };

  async function request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    let config: RequestInit & { url: string } = {
      ...options,
      url: `${baseUrl}${url}`,
    };

    for (const fn of requestInterceptors) {
      config = fn(config);
    }

    const { url: finalUrl, ...init } = config;
    const response = await fetch(finalUrl, init);
    let data = (await response.json().catch(() => ({}))) as T;

    for (const fn of responseInterceptors) {
      data = await fn(response, data);
    }

    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}`) as Error & {
        status: number;
        data: T;
      };
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return { data, status: response.status, headers: response.headers };
  }

  const get = <T>(url: string, options?: RequestInit) =>
    request<T>(url, { ...options, method: "GET" });

  const post = <T>(url: string, body?: unknown, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json", ...options?.headers },
    });

  const put = <T>(url: string, body?: unknown, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json", ...options?.headers },
    });

  const patch = <T>(url: string, body?: unknown, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json", ...options?.headers },
    });

  const del = <T>(url: string, options?: RequestInit) =>
    request<T>(url, { ...options, method: "DELETE" });

  return {
    request,
    get,
    post,
    put,
    patch,
    delete: del,
    addRequestInterceptor,
    addResponseInterceptor,
  };
}

export const apiClient = createApiClient(
  process.env.NEXT_PUBLIC_API_URL ?? ""
);
