import { describe, expect, it } from "vitest";

import {
  generateOTP,
  generateToken,
  generateUrlSafeToken,
  secureCompare,
  sha256,
} from "../../src/lib/crypto";

describe("crypto", () => {
  describe("generateToken", () => {
    it("should generate a 64-char hex string by default", () => {
      const token = generateToken();
      expect(token).toHaveLength(64);
      expect(token).toMatch(/^[a-f0-9]+$/);
    });

    it("should generate shorter tokens with fewer bytes", () => {
      const token = generateToken(16);
      expect(token).toHaveLength(32);
    });

    it("should generate unique tokens", () => {
      const t1 = generateToken();
      const t2 = generateToken();
      expect(t1).not.toBe(t2);
    });
  });

  describe("generateUrlSafeToken", () => {
    it("should generate a URL-safe token", () => {
      const token = generateUrlSafeToken();
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it("should not contain padding characters", () => {
      const token = generateUrlSafeToken();
      expect(token).not.toContain("=");
    });
  });

  describe("sha256", () => {
    it("should produce a consistent hash", () => {
      const hash1 = sha256("hello");
      const hash2 = sha256("hello");
      expect(hash1).toBe(hash2);
    });

    it("should produce different hashes for different inputs", () => {
      const hash1 = sha256("hello");
      const hash2 = sha256("world");
      expect(hash1).not.toBe(hash2);
    });

    it("should produce a 64-char hex string", () => {
      const hash = sha256("test");
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });
  });

  describe("secureCompare", () => {
    it("should return true for equal strings", () => {
      expect(secureCompare("abc", "abc")).toBe(true);
    });

    it("should return false for different strings", () => {
      expect(secureCompare("abc", "def")).toBe(false);
    });

    it("should return false for different length strings", () => {
      expect(secureCompare("abc", "abcd")).toBe(false);
    });
  });

  describe("generateOTP", () => {
    it("should generate a 6-digit OTP by default", () => {
      const otp = generateOTP();
      expect(otp).toHaveLength(6);
      expect(otp).toMatch(/^\d+$/);
    });

    it("should respect custom length", () => {
      const otp = generateOTP(4);
      expect(otp).toHaveLength(4);
      expect(otp).toMatch(/^\d+$/);
    });
  });
});
