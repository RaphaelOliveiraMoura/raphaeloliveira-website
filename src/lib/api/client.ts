import { ApiError, NetworkError, TimeoutError } from "@/lib/errors";

import type {
  ApiRequestConfig,
  ApiResponse,
  RequestInterceptor,
  ResponseInterceptor,
  RetryConfig,
} from "./types";

const DEFAULT_TIMEOUT = 30_000;

const DEFAULT_RETRY: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1_000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
}

function getRetryDelay(attempt: number, baseDelay: number): number {
  const delay = baseDelay * 2 ** attempt;
  const jitter = delay * 0.2 * Math.random();
  return delay + jitter;
}

function shouldRetry(
  status: number,
  method: string,
  retryConfig: RetryConfig,
): boolean {
  const isIdempotent = ["GET", "HEAD", "OPTIONS", "PUT", "DELETE"].includes(
    method.toUpperCase(),
  );
  if (!isIdempotent && status !== 429) return false;
  return retryConfig.retryableStatuses.includes(status);
}

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
    options: ApiRequestConfig = {},
  ): Promise<ApiResponse<T>> {
    const { timeout = DEFAULT_TIMEOUT, retry, ...fetchOptions } = options;

    const retryConfig: RetryConfig | null =
      retry === false
        ? null
        : { ...DEFAULT_RETRY, ...(retry as Partial<RetryConfig>) };

    let config: ApiRequestConfig & { url: string } = {
      ...fetchOptions,
      url: `${baseUrl}${url}`,
    };

    for (const fn of requestInterceptors) {
      config = fn(config);
    }

    const { url: finalUrl, ...init } = config;
    const method = (init.method ?? "GET").toUpperCase();

    const maxAttempts = retryConfig ? retryConfig.maxRetries + 1 : 1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const controller = new AbortController();
      const callerSignal = init.signal;

      // Propagar abort do caller para o controller interno
      if (callerSignal) {
        if (callerSignal.aborted) {
          controller.abort(callerSignal.reason);
        } else {
          callerSignal.addEventListener("abort", () => {
            controller.abort(callerSignal.reason);
          });
        }
      }

      const timeoutId = setTimeout(() => {
        controller.abort(new TimeoutError(timeout));
      }, timeout);

      try {
        const response = await fetch(finalUrl, {
          ...init,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        let data = (await response.json().catch(() => ({}))) as T;

        for (const fn of responseInterceptors) {
          data = await fn(response, data);
        }

        if (!response.ok) {
          if (
            retryConfig &&
            attempt < maxAttempts - 1 &&
            shouldRetry(response.status, method, retryConfig)
          ) {
            const delay = getRetryDelay(attempt, retryConfig.baseDelay);
            await sleep(delay, callerSignal ?? undefined);
            continue;
          }

          throw new ApiError(`HTTP ${response.status}`, response.status, {
            details:
              typeof data === "object" && data !== null
                ? (data as Record<string, unknown>)
                : undefined,
          });
        }

        return { data, status: response.status, headers: response.headers };
      } catch (err) {
        clearTimeout(timeoutId);

        // Se ja e um ApiError com retry pendente, ele foi re-thrown — nao retenta
        if (err instanceof ApiError) throw err;

        if (err instanceof DOMException && err.name === "AbortError") {
          const reason = controller.signal.reason;
          if (reason instanceof TimeoutError) throw reason;
          throw reason instanceof Error
            ? reason
            : new TimeoutError(timeout, { cause: err });
        }

        // Erro de rede - retentar se possivel
        if (retryConfig && attempt < maxAttempts - 1) {
          const delay = getRetryDelay(attempt, retryConfig.baseDelay);
          await sleep(delay, callerSignal ?? undefined);
          continue;
        }

        throw new NetworkError("Network request failed", { cause: err });
      }
    }

    // Fallback (nunca deve chegar aqui)
    throw new NetworkError("Request failed after all retries");
  }

  const get = <T>(url: string, options?: ApiRequestConfig) =>
    request<T>(url, { ...options, method: "GET" });

  const post = <T>(url: string, body?: unknown, options?: ApiRequestConfig) =>
    request<T>(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json", ...options?.headers },
    });

  const put = <T>(url: string, body?: unknown, options?: ApiRequestConfig) =>
    request<T>(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json", ...options?.headers },
    });

  const patch = <T>(url: string, body?: unknown, options?: ApiRequestConfig) =>
    request<T>(url, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json", ...options?.headers },
    });

  const del = <T>(url: string, options?: ApiRequestConfig) =>
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

export const apiClient = createApiClient(process.env.NEXT_PUBLIC_API_URL ?? "");
