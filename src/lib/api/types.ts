export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

export interface RetryConfig {
  /** Numero maximo de tentativas (default: 3) */
  maxRetries: number;
  /** Delay base em ms para backoff exponencial (default: 1000) */
  baseDelay: number;
  /** Status codes que devem ser retentados (default: [408, 429, 500, 502, 503, 504]) */
  retryableStatuses: number[];
}

export interface ApiRequestConfig extends RequestInit {
  /** Timeout em ms (default: 30000) */
  timeout?: number;
  /** Configuracao de retry. false desabilita retry. */
  retry?: Partial<RetryConfig> | false;
}

export type RequestInterceptor = (
  config: ApiRequestConfig & { url: string },
) => ApiRequestConfig & { url: string };

export type ResponseInterceptor = <T>(
  response: Response,
  data: T,
) => T | Promise<T>;
