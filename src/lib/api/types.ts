export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  status?: number;
  original?: unknown;
}

export type RequestInterceptor = (
  config: RequestInit & { url: string },
) => RequestInit & { url: string };

export type ResponseInterceptor = <T>(
  response: Response,
  data: T,
) => T | Promise<T>;
