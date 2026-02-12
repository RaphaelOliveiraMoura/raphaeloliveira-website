import { describe, expect, it } from "vitest";

import { normalizeApiError } from "@/lib/api/errors";
import {
  ApiError,
  AppError,
  AuthError,
  NetworkError,
  TimeoutError,
} from "@/lib/errors";

describe("normalizeApiError", () => {
  it("returns the same error if already an AppError", () => {
    const original = new ApiError("test", 500);
    expect(normalizeApiError(original)).toBe(original);
  });

  it("converts 401 status to AuthError UNAUTHENTICATED", () => {
    const err = { status: 401, message: "Unauthorized" };
    const result = normalizeApiError(err);
    expect(result).toBeInstanceOf(AuthError);
    expect(result.code).toBe("AUTH_UNAUTHENTICATED");
  });

  it("converts 403 status to AuthError UNAUTHORIZED", () => {
    const err = { status: 403, message: "Forbidden" };
    const result = normalizeApiError(err);
    expect(result).toBeInstanceOf(AuthError);
    expect(result.code).toBe("AUTH_UNAUTHORIZED");
  });

  it("converts other HTTP statuses to ApiError", () => {
    const err = { status: 500, message: "Server Error", code: "INTERNAL" };
    const result = normalizeApiError(err);
    expect(result).toBeInstanceOf(ApiError);
    expect((result as ApiError).status).toBe(500);
  });

  it("converts AbortError to TimeoutError", () => {
    const abort = new DOMException("Aborted", "AbortError");
    const result = normalizeApiError(abort);
    expect(result).toBeInstanceOf(TimeoutError);
  });

  it("converts TypeError with fetch to NetworkError", () => {
    const err = new TypeError("fetch failed");
    const result = normalizeApiError(err);
    expect(result).toBeInstanceOf(NetworkError);
  });

  it("converts unknown errors to AppError", () => {
    const result = normalizeApiError("random string");
    expect(result).toBeInstanceOf(AppError);
    expect(result.code).toBe("UNKNOWN");
  });

  it("extracts message from Error instances", () => {
    const err = new Error("custom message");
    const result = normalizeApiError(err);
    expect(result.message).toBe("custom message");
  });
});
