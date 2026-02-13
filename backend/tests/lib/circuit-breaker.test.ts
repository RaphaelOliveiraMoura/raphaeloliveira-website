import { describe, expect, it, vi } from "vitest";

import {
  CircuitBreaker,
  CircuitOpenError,
} from "../../src/lib/circuit-breaker";

describe("circuit-breaker", () => {
  describe("CircuitBreaker", () => {
    it("should start in closed state", () => {
      const breaker = new CircuitBreaker("test");
      expect(breaker.getState()).toBe("closed");
    });

    it("should execute successfully when closed", async () => {
      const breaker = new CircuitBreaker("test");
      const result = await breaker.execute(() => Promise.resolve("ok"));
      expect(result).toBe("ok");
    });

    it("should propagate errors from the executed function", async () => {
      const breaker = new CircuitBreaker("test", { failureThreshold: 10 });

      await expect(
        breaker.execute(() => Promise.reject(new Error("boom"))),
      ).rejects.toThrow("boom");
    });

    it("should transition to open after reaching failure threshold", async () => {
      const breaker = new CircuitBreaker("test", {
        failureThreshold: 3,
        resetTimeout: 60_000,
      });

      for (let i = 0; i < 3; i++) {
        await breaker
          .execute(() => Promise.reject(new Error("fail")))
          .catch(() => {});
      }

      expect(breaker.getState()).toBe("open");
    });

    it("should reject calls immediately when open", async () => {
      const breaker = new CircuitBreaker("test", {
        failureThreshold: 1,
        resetTimeout: 60_000,
      });

      // Trip the circuit
      await breaker
        .execute(() => Promise.reject(new Error("fail")))
        .catch(() => {});

      await expect(
        breaker.execute(() => Promise.resolve("ok")),
      ).rejects.toThrow(CircuitOpenError);
    });

    it("should include circuit name in CircuitOpenError", async () => {
      const breaker = new CircuitBreaker("smtp-service", {
        failureThreshold: 1,
        resetTimeout: 60_000,
      });

      await breaker
        .execute(() => Promise.reject(new Error("fail")))
        .catch(() => {});

      try {
        await breaker.execute(() => Promise.resolve("ok"));
        expect.unreachable("Should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(CircuitOpenError);
        expect((err as CircuitOpenError).circuitName).toBe("smtp-service");
      }
    });

    it("should reset consecutive failures on success", async () => {
      const breaker = new CircuitBreaker("test", { failureThreshold: 3 });

      // 2 failures
      await breaker
        .execute(() => Promise.reject(new Error("fail")))
        .catch(() => {});
      await breaker
        .execute(() => Promise.reject(new Error("fail")))
        .catch(() => {});

      // 1 success resets the counter
      await breaker.execute(() => Promise.resolve("ok"));

      // 2 more failures should not trip (counter was reset)
      await breaker
        .execute(() => Promise.reject(new Error("fail")))
        .catch(() => {});
      await breaker
        .execute(() => Promise.reject(new Error("fail")))
        .catch(() => {});

      expect(breaker.getState()).toBe("closed");
    });

    it("should transition to half_open after resetTimeout", async () => {
      vi.useFakeTimers();

      try {
        const breaker = new CircuitBreaker("test", {
          failureThreshold: 1,
          resetTimeout: 5000,
        });

        // Trip the circuit
        await breaker
          .execute(() => Promise.reject(new Error("fail")))
          .catch(() => {});
        expect(breaker.getState()).toBe("open");

        // Advance time past resetTimeout
        vi.advanceTimersByTime(5001);

        expect(breaker.getState()).toBe("half_open");
      } finally {
        vi.useRealTimers();
      }
    });

    it("should close circuit on success in half_open state", async () => {
      vi.useFakeTimers();

      try {
        const breaker = new CircuitBreaker("test", {
          failureThreshold: 1,
          resetTimeout: 5000,
          halfOpenMax: 1,
        });

        // Trip the circuit
        await breaker
          .execute(() => Promise.reject(new Error("fail")))
          .catch(() => {});

        // Advance to half_open
        vi.advanceTimersByTime(5001);

        // Successful call should close
        await breaker.execute(() => Promise.resolve("ok"));
        expect(breaker.getState()).toBe("closed");
      } finally {
        vi.useRealTimers();
      }
    });

    it("should re-open circuit on failure in half_open state", async () => {
      vi.useFakeTimers();

      try {
        const breaker = new CircuitBreaker("test", {
          failureThreshold: 1,
          resetTimeout: 5000,
        });

        // Trip the circuit
        await breaker
          .execute(() => Promise.reject(new Error("fail")))
          .catch(() => {});

        // Advance to half_open
        vi.advanceTimersByTime(5001);

        // Failure should re-open
        await breaker
          .execute(() => Promise.reject(new Error("fail again")))
          .catch(() => {});

        expect(breaker.getState()).toBe("open");
      } finally {
        vi.useRealTimers();
      }
    });

    it("should require halfOpenMax successes to close from half_open", async () => {
      vi.useFakeTimers();

      try {
        const breaker = new CircuitBreaker("test", {
          failureThreshold: 1,
          resetTimeout: 5000,
          halfOpenMax: 2,
        });

        // Trip the circuit
        await breaker
          .execute(() => Promise.reject(new Error("fail")))
          .catch(() => {});

        // Advance to half_open
        vi.advanceTimersByTime(5001);

        // First success — still half_open
        await breaker.execute(() => Promise.resolve("ok"));
        // Note: getState() returns half_open because internal state still is half_open
        // since halfOpenSuccesses (1) < halfOpenMax (2)

        // Second success — should close
        await breaker.execute(() => Promise.resolve("ok"));
        expect(breaker.getState()).toBe("closed");
      } finally {
        vi.useRealTimers();
      }
    });

    it("should track stats correctly", async () => {
      const breaker = new CircuitBreaker("test", { failureThreshold: 10 });

      await breaker.execute(() => Promise.resolve("ok"));
      await breaker.execute(() => Promise.resolve("ok"));
      await breaker
        .execute(() => Promise.reject(new Error("fail")))
        .catch(() => {});

      const stats = breaker.getStats();
      expect(stats.successes).toBe(2);
      expect(stats.failures).toBe(1);
      expect(stats.consecutiveFailures).toBe(1);
      expect(stats.state).toBe("closed");
      expect(stats.lastFailureTime).toBeTypeOf("number");
    });

    it("should manually reset the circuit", async () => {
      const breaker = new CircuitBreaker("test", {
        failureThreshold: 1,
        resetTimeout: 60_000,
      });

      // Trip the circuit
      await breaker
        .execute(() => Promise.reject(new Error("fail")))
        .catch(() => {});
      expect(breaker.getState()).toBe("open");

      // Manual reset
      breaker.reset();
      expect(breaker.getState()).toBe("closed");

      // Should work again
      const result = await breaker.execute(() => Promise.resolve("ok"));
      expect(result).toBe("ok");
    });

    it("should call monitor on state transitions", async () => {
      const monitor = vi.fn();
      const breaker = new CircuitBreaker("test", {
        failureThreshold: 1,
        monitor,
      });

      await breaker
        .execute(() => Promise.reject(new Error("fail")))
        .catch(() => {});

      expect(monitor).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "test",
          state: "open",
          previousState: "closed",
        }),
      );
    });

    it("should compose with withRetry pattern", async () => {
      const { withRetry } = await import("../../src/lib/retry");

      const breaker = new CircuitBreaker("test", {
        failureThreshold: 5,
        resetTimeout: 60_000,
      });

      // Compose: withRetry inside circuit breaker's execute
      let attempts = 0;
      const result = await breaker.execute(() =>
        withRetry(
          async () => {
            attempts++;
            if (attempts < 3) throw new Error("transient");
            return "ok";
          },
          { maxRetries: 3, baseDelay: 1, jitter: false },
        ),
      );

      expect(result).toBe("ok");
      expect(attempts).toBe(3);
      expect(breaker.getState()).toBe("closed");
    });
  });
});
