import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  parseCsv,
  parseCsvWithValidation,
  parseJsonWithValidation,
} from "@/lib/data";

describe("parseCsv", () => {
  it("parses simple CSV", () => {
    const csv = "name,email\nAlice,alice@test.com\nBob,bob@test.com";
    const result = parseCsv(csv);
    expect(result.headers).toEqual(["name", "email"]);
    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toEqual({ name: "Alice", email: "alice@test.com" });
    expect(result.errors).toHaveLength(0);
  });

  it("handles quoted fields", () => {
    const csv = 'name,bio\n"John ""Doe""","Has, commas"';
    const result = parseCsv(csv);
    expect(result.data[0]).toEqual({
      name: 'John "Doe"',
      bio: "Has, commas",
    });
  });

  it("reports column mismatch errors", () => {
    const csv = "a,b,c\n1,2\n4,5,6";
    const result = parseCsv(csv);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.row).toBe(2);
    expect(result.data).toHaveLength(1);
  });

  it("generates column headers when hasHeader is false", () => {
    const csv = "1,2,3\n4,5,6";
    const result = parseCsv(csv, { hasHeader: false });
    expect(result.headers).toEqual(["column_0", "column_1", "column_2"]);
    expect(result.data).toHaveLength(2);
  });

  it("respects maxRows option", () => {
    const csv = "n\n1\n2\n3\n4\n5";
    const result = parseCsv(csv, { maxRows: 3 });
    expect(result.data).toHaveLength(3);
    expect(result.totalRows).toBe(5);
  });

  it("handles empty content", () => {
    const result = parseCsv("");
    expect(result.data).toHaveLength(0);
    expect(result.headers).toHaveLength(0);
  });

  it("supports custom delimiter", () => {
    const csv = "name;age\nAlice;30";
    const result = parseCsv(csv, { delimiter: ";" });
    expect(result.data[0]).toEqual({ name: "Alice", age: "30" });
  });
});

describe("parseCsvWithValidation", () => {
  it("validates rows against Zod schema", () => {
    const csv = "name,age\nAlice,30\nBob,invalid\nCharlie,25";
    const schema = z.object({
      name: z.string(),
      age: z.coerce.number().min(1),
    });

    const result = parseCsvWithValidation(csv, schema);
    expect(result.data).toHaveLength(2);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.row).toBe(3); // row 3 (Bob, invalid)
  });
});

describe("parseJsonWithValidation", () => {
  it("parses valid JSON with schema", () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    const result = parseJsonWithValidation('{"name":"Alice","age":30}', schema);
    expect(result.data).toEqual({ name: "Alice", age: 30 });
    expect(result.error).toBeNull();
  });

  it("returns error for invalid JSON", () => {
    const schema = z.object({});
    const result = parseJsonWithValidation("not json", schema);
    expect(result.data).toBeNull();
    expect(result.error).toBe("Invalid JSON format");
  });

  it("returns validation error for schema mismatch", () => {
    const schema = z.object({ name: z.string() });
    const result = parseJsonWithValidation('{"age": 30}', schema);
    expect(result.data).toBeNull();
    expect(result.error).toBeTruthy();
  });
});
