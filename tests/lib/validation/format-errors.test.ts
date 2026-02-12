import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  formatValidationSummary,
  translateFieldErrors,
  zodToFieldErrors,
  zodToFieldMap,
} from "@/lib/validation";

describe("zodToFieldErrors", () => {
  it("converts ZodError to FieldError array", () => {
    const schema = z.object({
      email: z.email(),
      name: z.string().min(2),
    });

    const result = schema.safeParse({ email: "invalid", name: "" });
    if (result.success) throw new Error("Should have failed");

    const errors = zodToFieldErrors(result.error);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.field === "email")).toBe(true);
  });
});

describe("zodToFieldMap", () => {
  it("creates field -> message map", () => {
    const schema = z.object({
      email: z.email(),
      age: z.number().min(18),
    });

    const result = schema.safeParse({ email: "bad", age: 5 });
    if (result.success) throw new Error("Should have failed");

    const map = zodToFieldMap(result.error);
    expect(map.email).toBeDefined();
    expect(map.age).toBeDefined();
  });

  it("keeps only first error per field", () => {
    const schema = z.object({
      pw: z.string().min(8).regex(/[A-Z]/),
    });

    const result = schema.safeParse({ pw: "a" });
    if (result.success) throw new Error("Should have failed");

    const map = zodToFieldMap(result.error);
    expect(typeof map.pw).toBe("string"); // Only first error
  });
});

describe("translateFieldErrors", () => {
  it("translates keys using provided function", () => {
    const fieldMap = { email: "email.invalid", name: "required" };
    const translations: Record<string, string> = {
      "email.invalid": "Invalid email",
      required: "Required",
    };

    const result = translateFieldErrors(
      fieldMap,
      (key) => translations[key] ?? key,
    );
    expect(result.email).toBe("Invalid email");
    expect(result.name).toBe("Required");
  });

  it("falls back to key when translation missing", () => {
    const fieldMap = { field: "unknown.key" };
    const result = translateFieldErrors(fieldMap, () => {
      throw new Error("Missing key");
    });
    expect(result.field).toBe("unknown.key");
  });
});

describe("formatValidationSummary", () => {
  it("formats field map as readable string", () => {
    const summary = formatValidationSummary({
      email: "Invalid",
      name: "Required",
    });
    expect(summary).toContain("email: Invalid");
    expect(summary).toContain("name: Required");
  });
});
