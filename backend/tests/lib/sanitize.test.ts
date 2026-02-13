import { describe, expect, it } from "vitest";

import {
  escapeHtml,
  sanitizeFilename,
  sanitizeObject,
  sanitizeText,
  stripHtml,
  stripNullBytes,
} from "../../src/lib/sanitize";

describe("sanitize", () => {
  describe("escapeHtml", () => {
    it("should escape angle brackets", () => {
      expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
    });

    it("should escape quotes", () => {
      expect(escapeHtml('"hello"')).toBe("&quot;hello&quot;");
    });

    it("should escape ampersands", () => {
      expect(escapeHtml("a & b")).toBe("a &amp; b");
    });

    it("should handle string with no special chars", () => {
      expect(escapeHtml("hello world")).toBe("hello world");
    });
  });

  describe("stripHtml", () => {
    it("should remove HTML tags", () => {
      expect(stripHtml("<p>Hello <b>World</b></p>")).toBe("Hello World");
    });

    it("should handle self-closing tags", () => {
      expect(stripHtml("Hello<br/>World")).toBe("HelloWorld");
    });

    it("should handle nested tags", () => {
      expect(stripHtml("<div><span>text</span></div>")).toBe("text");
    });
  });

  describe("sanitizeText", () => {
    it("should strip HTML and trim", () => {
      expect(sanitizeText("  <b>Hello</b>  ")).toBe("Hello");
    });

    it("should handle script tags", () => {
      expect(sanitizeText('<script>alert("xss")</script>Hello')).toBe(
        'alert("xss")Hello',
      );
    });
  });

  describe("sanitizeObject", () => {
    it("should sanitize all string values", () => {
      const result = sanitizeObject({
        name: "<b>John</b>",
        bio: "<script>x</script>",
        age: 30,
      });

      expect(result).toEqual({
        name: "John",
        bio: "x",
        age: 30,
      });
    });

    it("should handle nested objects", () => {
      const result = sanitizeObject({
        user: { name: "<i>Jane</i>" },
      });

      expect(result).toEqual({
        user: { name: "Jane" },
      });
    });

    it("should handle arrays", () => {
      const result = sanitizeObject(["<b>a</b>", "<i>b</i>"]);
      expect(result).toEqual(["a", "b"]);
    });

    it("should pass through non-strings", () => {
      const result = sanitizeObject({ n: 42, b: true, x: null });
      expect(result).toEqual({ n: 42, b: true, x: null });
    });
  });

  describe("stripNullBytes", () => {
    it("should remove null bytes", () => {
      expect(stripNullBytes("hello\0world")).toBe("helloworld");
    });

    it("should handle strings without null bytes", () => {
      expect(stripNullBytes("hello")).toBe("hello");
    });
  });

  describe("sanitizeFilename", () => {
    it("should remove path traversal", () => {
      expect(sanitizeFilename("../../../etc/passwd")).toBe("etc-passwd");
    });

    it("should replace special characters", () => {
      expect(sanitizeFilename("my file (1).pdf")).toBe("my-file-1-.pdf");
    });

    it("should handle normal filenames", () => {
      expect(sanitizeFilename("document.pdf")).toBe("document.pdf");
    });

    it("should handle backslashes", () => {
      expect(sanitizeFilename("path\\to\\file.txt")).toBe("path-to-file.txt");
    });
  });
});
