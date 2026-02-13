import { describe, expect, it } from "vitest";

import {
  expiresIn,
  formatDuration,
  parseDuration,
} from "../../src/lib/duration";

describe("duration", () => {
  describe("parseDuration", () => {
    it("should parse seconds", () => {
      expect(parseDuration("30s")).toBe(30_000);
    });

    it("should parse minutes", () => {
      expect(parseDuration("15m")).toBe(900_000);
    });

    it("should parse hours", () => {
      expect(parseDuration("2h")).toBe(7_200_000);
    });

    it("should parse days", () => {
      expect(parseDuration("7d")).toBe(604_800_000);
    });

    it("should return fallback for invalid input", () => {
      expect(parseDuration("invalid")).toBe(7 * 86_400_000);
    });

    it("should accept custom fallback", () => {
      expect(parseDuration("bad", 5000)).toBe(5000);
    });
  });

  describe("formatDuration", () => {
    it("should format to days", () => {
      expect(formatDuration(86_400_000)).toBe("1d");
    });

    it("should format to hours", () => {
      expect(formatDuration(7_200_000)).toBe("2h");
    });

    it("should format to minutes", () => {
      expect(formatDuration(900_000)).toBe("15m");
    });

    it("should format to seconds", () => {
      expect(formatDuration(5_000)).toBe("5s");
    });
  });

  describe("expiresIn", () => {
    it("should return a future date", () => {
      const before = Date.now();
      const date = expiresIn("1h");
      const after = Date.now();

      expect(date.getTime()).toBeGreaterThanOrEqual(before + 3_600_000);
      expect(date.getTime()).toBeLessThanOrEqual(after + 3_600_000);
    });
  });
});
