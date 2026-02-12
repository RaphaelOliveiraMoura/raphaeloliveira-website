import { AppError } from "./base";

/**
 * Erro de resposta HTTP (4xx, 5xx).
 */
export class ApiError extends AppError {
  readonly status: number;
  readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    options?: {
      code?: string;
      details?: Record<string, unknown>;
      cause?: unknown;
      context?: Record<string, unknown>;
    },
  ) {
    super(message, options?.code ?? `HTTP_${status}`, {
      cause: options?.cause,
      context: { ...options?.context, status },
    });
    this.name = "ApiError";
    this.status = status;
    this.details = options?.details;
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      status: this.status,
      details: this.details,
    };
  }
}

/**
 * Erro de rede (sem conectividade, timeout, DNS, etc.).
 */
export class NetworkError extends AppError {
  constructor(
    message = "Network request failed",
    options?: { cause?: unknown; context?: Record<string, unknown> },
  ) {
    super(message, "NETWORK_ERROR", options);
    this.name = "NetworkError";
  }
}

/**
 * Erro de timeout na requisicao.
 */
export class TimeoutError extends AppError {
  readonly timeoutMs: number;

  constructor(
    timeoutMs: number,
    options?: { cause?: unknown; context?: Record<string, unknown> },
  ) {
    super(`Request timed out after ${timeoutMs}ms`, "TIMEOUT_ERROR", {
      ...options,
      context: { ...options?.context, timeoutMs },
    });
    this.name = "TimeoutError";
    this.timeoutMs = timeoutMs;
  }
}
