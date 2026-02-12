import { describe, expect, it } from "vitest";

import {
  ApiError,
  AppError,
  AuthError,
  NetworkError,
  TimeoutError,
  ValidationError,
} from "@/lib/errors";

describe("AppError", () => {
  it("creates error with default code", () => {
    const error = new AppError("something failed");
    expect(error.message).toBe("something failed");
    expect(error.code).toBe("APP_ERROR");
    expect(error.name).toBe("AppError");
    expect(error).toBeInstanceOf(Error);
  });

  it("creates error with custom code and context", () => {
    const error = new AppError("failed", "CUSTOM_CODE", {
      context: { userId: "123" },
    });
    expect(error.code).toBe("CUSTOM_CODE");
    expect(error.context).toEqual({ userId: "123" });
  });

  it("preserves cause", () => {
    const cause = new Error("original");
    const error = new AppError("wrapper", "WRAP", { cause });
    expect(error.cause).toBe(cause);
  });

  it("serializes to JSON", () => {
    const cause = new Error("cause msg");
    const error = new AppError("msg", "CODE", {
      cause,
      context: { key: "val" },
    });
    const json = error.toJSON();
    expect(json).toEqual({
      name: "AppError",
      code: "CODE",
      message: "msg",
      context: { key: "val" },
      cause: { name: "Error", message: "cause msg" },
    });
  });
});

describe("ApiError", () => {
  it("creates with status", () => {
    const error = new ApiError("Not Found", 404);
    expect(error.status).toBe(404);
    expect(error.code).toBe("HTTP_404");
    expect(error.name).toBe("ApiError");
    expect(error).toBeInstanceOf(AppError);
  });

  it("detects client vs server error", () => {
    expect(new ApiError("Bad Request", 400).isClientError).toBe(true);
    expect(new ApiError("Bad Request", 400).isServerError).toBe(false);
    expect(new ApiError("Server Error", 500).isServerError).toBe(true);
    expect(new ApiError("Server Error", 500).isClientError).toBe(false);
  });

  it("includes details in JSON", () => {
    const error = new ApiError("Validation", 422, {
      details: { field: "email" },
    });
    expect(error.toJSON().details).toEqual({ field: "email" });
  });
});

describe("NetworkError", () => {
  it("creates with default message", () => {
    const error = new NetworkError();
    expect(error.message).toBe("Network request failed");
    expect(error.code).toBe("NETWORK_ERROR");
  });
});

describe("TimeoutError", () => {
  it("creates with timeout value", () => {
    const error = new TimeoutError(5000);
    expect(error.message).toBe("Request timed out after 5000ms");
    expect(error.code).toBe("TIMEOUT_ERROR");
    expect(error.timeoutMs).toBe(5000);
  });
});

describe("AuthError", () => {
  it("creates with auth code", () => {
    const error = new AuthError("Token expired", "AUTH_TOKEN_EXPIRED");
    expect(error.code).toBe("AUTH_TOKEN_EXPIRED");
    expect(error.name).toBe("AuthError");
    expect(error).toBeInstanceOf(AppError);
  });
});

describe("ValidationError", () => {
  it("creates with field errors", () => {
    const fieldErrors = [
      { field: "email", message: "Invalid email" },
      { field: "name", message: "Required" },
    ];
    const error = new ValidationError(fieldErrors);
    expect(error.fieldErrors).toEqual(fieldErrors);
    expect(error.code).toBe("VALIDATION_ERROR");
  });

  it("converts to field map", () => {
    const error = new ValidationError([
      { field: "email", message: "Invalid" },
      { field: "email", message: "Too long" },
      { field: "name", message: "Required" },
    ]);
    expect(error.toFieldMap()).toEqual({
      email: ["Invalid", "Too long"],
      name: ["Required"],
    });
  });
});
