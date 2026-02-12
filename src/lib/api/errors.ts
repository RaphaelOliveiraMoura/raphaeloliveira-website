import {
  ApiError,
  AppError,
  AuthError,
  NetworkError,
  TimeoutError,
} from "@/lib/errors";

/**
 * Normaliza qualquer erro em uma instancia tipada de AppError.
 * Preserva a instancia original se ja for um AppError.
 */
export function normalizeApiError(err: unknown): AppError {
  if (err instanceof AppError) return err;

  if (err instanceof DOMException && err.name === "AbortError") {
    return new TimeoutError(0, { cause: err });
  }

  if (err instanceof TypeError && err.message.includes("fetch")) {
    return new NetworkError("Network request failed", { cause: err });
  }

  if (typeof err === "object" && err !== null) {
    const e = err as {
      message?: string;
      code?: string;
      status?: number;
      details?: Record<string, unknown>;
    };

    if (e.status === 401 || e.status === 403) {
      return new AuthError(
        e.message ?? "Authentication required",
        e.status === 401 ? "AUTH_UNAUTHENTICATED" : "AUTH_UNAUTHORIZED",
        { cause: err },
      );
    }

    if (typeof e.status === "number") {
      return new ApiError(e.message ?? `HTTP ${e.status}`, e.status, {
        code: e.code,
        details: e.details,
        cause: err,
      });
    }
  }

  const message =
    err instanceof Error ? err.message : "An unknown error occurred";
  return new AppError(message, "UNKNOWN", { cause: err });
}
