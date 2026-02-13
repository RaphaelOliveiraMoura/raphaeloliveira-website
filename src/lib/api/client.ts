import { ApiError, NetworkError, TimeoutError } from "@/lib/errors";

import { notifyRefreshFailure, refreshWithMutex } from "./auth-interceptor";
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

  /**
   * Executa um fetch unico com timeout e abort signal.
   * Retorna a Response crua para o caller processar.
   */
  async function executeFetch(
    finalUrl: string,
    init: RequestInit,
    timeout: number,
    callerSignal?: AbortSignal | null,
  ): Promise<Response> {
    const controller = new AbortController();

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
      return response;
    } catch (err) {
      clearTimeout(timeoutId);

      if (err instanceof DOMException && err.name === "AbortError") {
        const reason = controller.signal.reason;
        if (reason instanceof TimeoutError) throw reason;
        throw reason instanceof Error
          ? reason
          : new TimeoutError(timeout, { cause: err });
      }

      throw err;
    }
  }

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
    const callerSignal = init.signal;

    const maxAttempts = retryConfig ? retryConfig.maxRetries + 1 : 1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await executeFetch(
          finalUrl,
          init,
          timeout,
          callerSignal,
        );

        let data = (await response.json().catch(() => ({}))) as T;

        for (const fn of responseInterceptors) {
          data = await fn(response, data);
        }

        // 401: tentar refresh + retry da request original (uma unica vez)
        if (response.status === 401) {
          const newToken = await refreshWithMutex();
          if (newToken) {
            // Re-executar a request com o novo token
            const retryInit = {
              ...init,
              headers: {
                ...init.headers,
                Authorization: `Bearer ${newToken}`,
              },
            };

            const retryResponse = await executeFetch(
              finalUrl,
              retryInit,
              timeout,
              callerSignal,
            );

            let retryData = (await retryResponse.json().catch(() => ({}))) as T;

            for (const fn of responseInterceptors) {
              retryData = await fn(retryResponse, retryData);
            }

            if (!retryResponse.ok) {
              throw new ApiError(
                `HTTP ${retryResponse.status}`,
                retryResponse.status,
                {
                  details:
                    typeof retryData === "object" && retryData !== null
                      ? (retryData as Record<string, unknown>)
                      : undefined,
                },
              );
            }

            return {
              data: retryData,
              status: retryResponse.status,
              headers: retryResponse.headers,
            };
          }

          // Refresh falhou -- sessao expirada
          notifyRefreshFailure();
          throw new ApiError("Authentication required", 401, {
            details: {
              message:
                typeof data === "object" && data !== null
                  ? ((data as Record<string, unknown>).message as string)
                  : undefined,
            },
          });
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
        // Se ja e um ApiError, propagar diretamente
        if (err instanceof ApiError) throw err;

        // Timeouts ja foram tratados no executeFetch
        if (err instanceof TimeoutError) throw err;

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

  /**
   * Monta body e headers para requests com JSON body.
   * Quando body e undefined, nao envia Content-Type nem body,
   * evitando FST_ERR_CTP_EMPTY_JSON_BODY no Fastify.
   */
  function withJsonBody(
    body: unknown,
    options?: ApiRequestConfig,
  ): Pick<ApiRequestConfig, "body" | "headers"> {
    if (body === undefined) {
      return options?.headers ? { headers: options.headers } : {};
    }
    return {
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json", ...options?.headers },
    };
  }

  const get = <T>(url: string, options?: ApiRequestConfig) =>
    request<T>(url, { ...options, method: "GET" });

  const post = <T>(url: string, body?: unknown, options?: ApiRequestConfig) =>
    request<T>(url, {
      ...options,
      method: "POST",
      ...withJsonBody(body, options),
    });

  const put = <T>(url: string, body?: unknown, options?: ApiRequestConfig) =>
    request<T>(url, {
      ...options,
      method: "PUT",
      ...withJsonBody(body, options),
    });

  const patch = <T>(url: string, body?: unknown, options?: ApiRequestConfig) =>
    request<T>(url, {
      ...options,
      method: "PATCH",
      ...withJsonBody(body, options),
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
