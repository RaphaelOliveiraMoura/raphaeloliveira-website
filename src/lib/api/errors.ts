import type { ApiError } from "./types";

export function normalizeApiError(err: unknown): ApiError {
  if (typeof err === "object" && err !== null && "message" in err) {
    const e = err as {
      message?: string;
      code?: string;
      status?: number;
      details?: Record<string, unknown>;
    };
    return {
      code: e.code ?? "UNKNOWN",
      message: e.message ?? "Erro desconhecido",
      status: e.status,
      details: e.details,
      original: err,
    };
  }
  return {
    code: "UNKNOWN",
    message: err instanceof Error ? err.message : "Erro desconhecido",
    original: err,
  };
}
