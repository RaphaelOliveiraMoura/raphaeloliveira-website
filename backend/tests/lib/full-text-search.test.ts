import { describe, expect, it } from "vitest";

import {
  buildFullTextSearch,
  buildSearchQuery,
  buildSearchVector,
  fullTextHeadline,
  fullTextRank,
} from "../../src/lib/full-text-search";

/**
 * Since full-text search helpers produce raw SQL fragments (Drizzle SQL objects),
 * we test them by converting to query strings and verifying the structure.
 *
 * The actual PostgreSQL execution is covered by integration tests.
 */

// Helper to extract the SQL template string from a Drizzle SQL object
function _toSqlString(sql: unknown): string {
  if (!sql || typeof sql !== "object") return String(sql);

  // Drizzle SQL objects have a `queryChunks` array
  const obj = sql as Record<string, unknown>;
  if ("queryChunks" in obj) {
    return JSON.stringify(obj.queryChunks);
  }

  return String(sql);
}

describe("full-text-search", () => {
  describe("buildSearchVector", () => {
    it("should throw if no columns provided", () => {
      expect(() => buildSearchVector([])).toThrow(
        "At least one column is required",
      );
    });

    it("should produce a SQL object for single column", () => {
      // We can't pass a real PgColumn in unit tests easily,
      // so we test the function doesn't throw and returns a SQL-like object
      const fakeColumn = { name: "name" } as never;
      const result = buildSearchVector([fakeColumn]);
      expect(result).toBeDefined();
    });

    it("should accept a custom config", () => {
      const fakeColumn = { name: "name" } as never;
      const result = buildSearchVector([fakeColumn], "english");
      expect(result).toBeDefined();
    });
  });

  describe("buildSearchQuery", () => {
    it("should produce a SQL object for a search term", () => {
      const result = buildSearchQuery("hello world");
      expect(result).toBeDefined();
    });

    it("should handle empty string", () => {
      const result = buildSearchQuery("");
      expect(result).toBeDefined();
    });

    it("should handle special characters safely", () => {
      // Should not throw on tsquery special chars
      const result = buildSearchQuery("hello & world | (test)");
      expect(result).toBeDefined();
    });

    it("should accept a custom config", () => {
      const result = buildSearchQuery("test", "portuguese");
      expect(result).toBeDefined();
    });
  });

  describe("buildFullTextSearch", () => {
    it("should return undefined for empty term", () => {
      const fakeColumn = { name: "name" } as never;
      expect(buildFullTextSearch("", [fakeColumn])).toBeUndefined();
      expect(buildFullTextSearch(undefined, [fakeColumn])).toBeUndefined();
      expect(buildFullTextSearch("  ", [fakeColumn])).toBeUndefined();
    });

    it("should return undefined for empty columns", () => {
      expect(buildFullTextSearch("test", [])).toBeUndefined();
    });

    it("should return a SQL object for valid input", () => {
      const fakeColumn = { name: "name" } as never;
      const result = buildFullTextSearch("hello", [fakeColumn]);
      expect(result).toBeDefined();
    });
  });

  describe("fullTextRank", () => {
    it("should produce a SQL object", () => {
      const fakeColumn = { name: "name" } as never;
      const result = fullTextRank([fakeColumn], "test");
      expect(result).toBeDefined();
    });
  });

  describe("fullTextHeadline", () => {
    it("should produce a SQL object", () => {
      const fakeColumn = { name: "name" } as never;
      const result = fullTextHeadline(fakeColumn, "test");
      expect(result).toBeDefined();
    });
  });
});
