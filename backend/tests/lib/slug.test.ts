import { describe, expect, it } from "vitest";

import { slugify, uniqueSlug } from "../../src/lib/slug";

describe("slug", () => {
  describe("slugify", () => {
    it("should convert to lowercase", () => {
      expect(slugify("Hello World")).toBe("hello-world");
    });

    it("should replace spaces with hyphens", () => {
      expect(slugify("my post title")).toBe("my-post-title");
    });

    it("should remove diacritics", () => {
      expect(slugify("Café & Résumé")).toBe("cafe-resume");
    });

    it("should remove special characters", () => {
      expect(slugify("Hello World!")).toBe("hello-world");
    });

    it("should collapse multiple hyphens", () => {
      expect(slugify("hello---world")).toBe("hello-world");
    });

    it("should trim leading/trailing hyphens", () => {
      expect(slugify("  My  Post  Title ")).toBe("my-post-title");
    });

    it("should handle empty string", () => {
      expect(slugify("")).toBe("");
    });

    it("should handle numbers", () => {
      expect(slugify("Post 123")).toBe("post-123");
    });
  });

  describe("uniqueSlug", () => {
    it("should append a random suffix", () => {
      const slug = uniqueSlug("My Post");
      expect(slug).toMatch(/^my-post-[a-z0-9]+$/);
    });

    it("should generate different slugs each time", () => {
      const slug1 = uniqueSlug("Same");
      const slug2 = uniqueSlug("Same");
      expect(slug1).not.toBe(slug2);
    });

    it("should respect suffix length", () => {
      const slug = uniqueSlug("Test", 10);
      const suffix = slug.replace("test-", "");
      expect(suffix.length).toBe(10);
    });
  });
});
