import { describe, expect, it, vi } from "vitest";

import { RetryExhaustedError, withRetry } from "../../src/lib/retry";

describe("retry", () => {
  describe("withRetry", () => {
    it("should return the result on first success", async () => {
      const fn = vi.fn().mockResolvedValue("ok");

      const result = await withRetry(fn, { maxRetries: 3, baseDelay: 10 });

      expect(result).toBe("ok");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should retry on failure and succeed eventually", async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("fail 1"))
        .mockRejectedValueOnce(new Error("fail 2"))
        .mockResolvedValue("ok");

      const result = await withRetry(fn, {
        maxRetries: 3,
        baseDelay: 10,
        jitter: false,
      });

      expect(result).toBe("ok");
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("should throw RetryExhaustedError after all retries fail", async () => {
      const fn = vi.fn().mockRejectedValue(new Error("always fails"));

      await expect(
        withRetry(fn, { maxRetries: 2, baseDelay: 10, jitter: false }),
      ).rejects.toThrow(RetryExhaustedError);

      // 1 initial + 2 retries = 3
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("should include attempt count and last error in RetryExhaustedError", async () => {
      const originalError = new Error("original");
      const fn = vi.fn().mockRejectedValue(originalError);

      try {
        await withRetry(fn, { maxRetries: 2, baseDelay: 10, jitter: false });
        expect.unreachable("Should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(RetryExhaustedError);
        const retryErr = err as RetryExhaustedError;
        expect(retryErr.attempts).toBe(2);
        expect(retryErr.lastError).toBe(originalError);
        expect(retryErr.message).toContain("original");
      }
    });

    it("should not retry when retryIf returns false", async () => {
      const fn = vi.fn().mockRejectedValue(new Error("non-retryable"));

      await expect(
        withRetry(fn, {
          maxRetries: 3,
          baseDelay: 10,
          retryIf: () => false,
        }),
      ).rejects.toThrow(RetryExhaustedError);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should only retry matching errors via retryIf", async () => {
      class TransientError extends Error {
        constructor() {
          super("transient");
          this.name = "TransientError";
        }
      }

      const fn = vi
        .fn()
        .mockRejectedValueOnce(new TransientError())
        .mockRejectedValue(new Error("permanent"));

      await expect(
        withRetry(fn, {
          maxRetries: 5,
          baseDelay: 10,
          retryIf: (err) => err instanceof TransientError,
        }),
      ).rejects.toThrow(RetryExhaustedError);

      // First call fails with TransientError (retryable) → retries
      // Second call fails with Error (not retryable) → stops
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should call onRetry callback before each retry", async () => {
      const onRetry = vi.fn();
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("fail"))
        .mockResolvedValue("ok");

      await withRetry(fn, {
        maxRetries: 3,
        baseDelay: 10,
        jitter: false,
        onRetry,
      });

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(
        1,
        expect.any(Error),
        expect.any(Number),
      );
    });

    it("should abort when signal is already aborted", async () => {
      const fn = vi.fn().mockResolvedValue("ok");
      const controller = new AbortController();
      controller.abort(new Error("cancelled"));

      await expect(
        withRetry(fn, {
          maxRetries: 3,
          baseDelay: 10,
          signal: controller.signal,
        }),
      ).rejects.toThrow("cancelled");
    });

    it("should abort during retry delay when signal fires", async () => {
      const controller = new AbortController();
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("fail"))
        .mockResolvedValue("ok");

      // Abort after a short delay
      setTimeout(() => controller.abort(new Error("cancelled")), 20);

      await expect(
        withRetry(fn, {
          maxRetries: 3,
          baseDelay: 5000, // Long delay so abort fires during sleep
          jitter: false,
          signal: controller.signal,
        }),
      ).rejects.toThrow("cancelled");

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should respect maxDelay cap", async () => {
      const onRetry = vi.fn();
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("fail"))
        .mockRejectedValueOnce(new Error("fail"))
        .mockRejectedValueOnce(new Error("fail"))
        .mockResolvedValue("ok");

      await withRetry(fn, {
        maxRetries: 3,
        baseDelay: 10,
        maxDelay: 15,
        jitter: false,
        onRetry,
      });

      // All delays should be <= maxDelay
      for (const call of onRetry.mock.calls) {
        expect(call[2]).toBeLessThanOrEqual(15);
      }
    });

    it("should apply jitter when enabled", async () => {
      const delays: number[] = [];
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("fail"))
        .mockRejectedValueOnce(new Error("fail"))
        .mockResolvedValue("ok");

      await withRetry(fn, {
        maxRetries: 3,
        baseDelay: 100,
        jitter: true,
        onRetry: (_attempt, _error, delay) => {
          delays.push(delay);
        },
      });

      // Jitter adds randomness, so delays should be less than the max exponential value
      for (const delay of delays) {
        expect(delay).toBeGreaterThanOrEqual(0);
        expect(delay).toBeLessThanOrEqual(30_000);
      }
    });

    it("should work with zero retries (no retry)", async () => {
      const fn = vi.fn().mockRejectedValue(new Error("fail"));

      await expect(
        withRetry(fn, { maxRetries: 0, baseDelay: 10 }),
      ).rejects.toThrow(RetryExhaustedError);

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
