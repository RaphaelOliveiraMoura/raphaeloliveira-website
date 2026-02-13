import { describe, expect, it } from "vitest";

import { createListSchema } from "../../src/lib/query-builder";

describe("query-builder", () => {
  describe("createListSchema", () => {
    it("should create a schema with sort and order", () => {
      const schema = createListSchema(
        ["createdAt", "name", "email"] as const,
        "createdAt",
      );

      const result = schema.parse({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.sort).toBe("createdAt");
      expect(result.order).toBe("desc");
    });

    it("should accept custom sort field", () => {
      const schema = createListSchema(
        ["createdAt", "name"] as const,
        "createdAt",
      );

      const result = schema.parse({ sort: "name", order: "asc" });

      expect(result.sort).toBe("name");
      expect(result.order).toBe("asc");
    });

    it("should reject invalid sort field", () => {
      const schema = createListSchema(
        ["createdAt", "name"] as const,
        "createdAt",
      );

      const result = schema.safeParse({ sort: "invalid" });
      expect(result.success).toBe(false);
    });

    it("should accept pagination overrides", () => {
      const schema = createListSchema(["createdAt"] as const);
      const result = schema.parse({ page: 3, limit: 50 });

      expect(result.page).toBe(3);
      expect(result.limit).toBe(50);
    });
  });
});
