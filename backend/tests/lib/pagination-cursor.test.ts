import { describe, expect, it } from "vitest";

import {
  cursorPaginate,
  decodeCursor,
  encodeCursor,
} from "../../src/lib/pagination";

describe("cursor pagination", () => {
  describe("encodeCursor / decodeCursor", () => {
    it("should encode and decode a cursor round-trip", () => {
      const original = { id: "abc-123", createdAt: "2024-01-01T00:00:00Z" };
      const encoded = encodeCursor(original);
      const decoded = decodeCursor(encoded);

      expect(decoded).toEqual(original);
    });

    it("should produce URL-safe strings", () => {
      const cursor = encodeCursor({ id: "test/value+special=chars" });
      // base64url does not contain +, /, or =
      expect(cursor).not.toMatch(/[+/=]/);
    });

    it("should return null for invalid cursor", () => {
      expect(decodeCursor("not-valid-base64!!!")).toBeNull();
    });

    it("should return null for non-JSON base64", () => {
      const nonJson = Buffer.from("not json").toString("base64url");
      expect(decodeCursor(nonJson)).toBeNull();
    });
  });

  describe("cursorPaginate", () => {
    interface Item {
      id: string;
      name: string;
    }

    const items: Item[] = [
      { id: "1", name: "Alice" },
      { id: "2", name: "Bob" },
      { id: "3", name: "Charlie" },
    ];

    it("should indicate hasMore when data exceeds limit", () => {
      // Simulate fetching limit + 1 rows
      const result = cursorPaginate(items, 2, "id");

      expect(result.data).toHaveLength(2);
      expect(result.meta.hasMore).toBe(true);
      expect(result.meta.nextCursor).not.toBeNull();
    });

    it("should indicate no more when data fits within limit", () => {
      const result = cursorPaginate(items.slice(0, 2), 3, "id");

      expect(result.data).toHaveLength(2);
      expect(result.meta.hasMore).toBe(false);
      expect(result.meta.nextCursor).toBeNull();
    });

    it("should use last item's key as cursor", () => {
      const result = cursorPaginate(items, 2, "id");

      const decoded = decodeCursor(result.meta.nextCursor!);
      expect(decoded).toEqual({ id: "2" });
    });

    it("should handle empty data", () => {
      const result = cursorPaginate([], 10, "id" as keyof Item);

      expect(result.data).toHaveLength(0);
      expect(result.meta.hasMore).toBe(false);
      expect(result.meta.nextCursor).toBeNull();
    });

    it("should handle exact limit match (no more)", () => {
      const twoItems = items.slice(0, 2);
      const result = cursorPaginate(twoItems, 2, "id");

      expect(result.data).toHaveLength(2);
      expect(result.meta.hasMore).toBe(false);
    });

    it("should preserve limit in meta", () => {
      const result = cursorPaginate(items, 2, "id");
      expect(result.meta.limit).toBe(2);
    });
  });
});
