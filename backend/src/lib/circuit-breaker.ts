import { logger } from "./logger";

const log = logger.child({ module: "circuit-breaker" });

/** Circuit breaker states. */
export type CircuitState = "closed" | "open" | "half_open";

/** Events emitted by the circuit breaker for observability. */
export interface CircuitEvent {
  name: string;
  state: CircuitState;
  previousState?: CircuitState;
  failures?: number;
  error?: unknown;
}

/**
 * Options for configuring the circuit breaker.
 */
export interface CircuitBreakerOptions {
  /** Number of consecutive failures to open the circuit (default: 5). */
  failureThreshold?: number;
  /** Time in ms to wait in OPEN state before transitioning to HALF_OPEN (default: 30000). */
  resetTimeout?: number;
  /** Number of successful calls in HALF_OPEN to close the circuit (default: 1). */
  halfOpenMax?: number;
  /** Optional monitor callback for observability. */
  monitor?: (event: CircuitEvent) => void;
}

/**
 * Error thrown when the circuit is open and calls are rejected.
 */
export class CircuitOpenError extends Error {
  public readonly circuitName: string;

  constructor(name: string) {
    super(`Circuit breaker '${name}' is open — call rejected`);
    this.name = "CircuitOpenError";
    this.circuitName = name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/** Internal stats tracked by the circuit breaker. */
export interface CircuitStats {
  state: CircuitState;
  failures: number;
  successes: number;
  consecutiveFailures: number;
  lastFailureTime: number | null;
}

/**
 * Circuit Breaker pattern implementation.
 *
 * Protects external service calls by tracking failures and short-circuiting
 * when a failure threshold is reached.
 *
 * States:
 * - **CLOSED** — Normal operation. Failures are counted.
 * - **OPEN** — Calls are rejected immediately. After `resetTimeout`, moves to HALF_OPEN.
 * - **HALF_OPEN** — A limited number of calls are allowed through. Success closes; failure re-opens.
 *
 * @example
 * ```ts
 * const breaker = new CircuitBreaker("smtp", { failureThreshold: 3, resetTimeout: 10000 });
 *
 * try {
 *   const result = await breaker.execute(() => sendEmail(to, subject, body));
 * } catch (err) {
 *   if (err instanceof CircuitOpenError) {
 *     // Circuit is open — use fallback
 *   }
 * }
 * ```
 */
export class CircuitBreaker {
  private state: CircuitState = "closed";
  private consecutiveFailures = 0;
  private successes = 0;
  private totalFailures = 0;
  private totalSuccesses = 0;
  private lastFailureTime: number | null = null;
  private halfOpenSuccesses = 0;

  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly halfOpenMax: number;
  private readonly monitor?: (event: CircuitEvent) => void;

  constructor(
    public readonly name: string,
    options?: CircuitBreakerOptions,
  ) {
    this.failureThreshold = options?.failureThreshold ?? 5;
    this.resetTimeout = options?.resetTimeout ?? 30_000;
    this.halfOpenMax = options?.halfOpenMax ?? 1;
    this.monitor = options?.monitor;
  }

  /**
   * Execute a function through the circuit breaker.
   * Throws `CircuitOpenError` if the circuit is open.
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if we should transition from OPEN to HALF_OPEN
    if (this.state === "open") {
      if (this.shouldTransitionToHalfOpen()) {
        this.transitionTo("half_open");
      } else {
        throw new CircuitOpenError(this.name);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  /**
   * Get the current circuit state.
   */
  getState(): CircuitState {
    // Check for auto-transition before reporting state
    if (this.state === "open" && this.shouldTransitionToHalfOpen()) {
      return "half_open";
    }
    return this.state;
  }

  /**
   * Get circuit breaker statistics.
   */
  getStats(): CircuitStats {
    return {
      state: this.getState(),
      failures: this.totalFailures,
      successes: this.totalSuccesses,
      consecutiveFailures: this.consecutiveFailures,
      lastFailureTime: this.lastFailureTime,
    };
  }

  /**
   * Manually reset the circuit to CLOSED state.
   */
  reset(): void {
    const previous = this.state;
    this.state = "closed";
    this.consecutiveFailures = 0;
    this.halfOpenSuccesses = 0;
    this.lastFailureTime = null;

    if (previous !== "closed") {
      this.emitEvent("closed", previous);
    }

    log.info({ circuit: this.name }, "Circuit breaker manually reset");
  }

  private shouldTransitionToHalfOpen(): boolean {
    if (this.lastFailureTime === null) return false;
    return Date.now() - this.lastFailureTime >= this.resetTimeout;
  }

  private onSuccess(): void {
    this.totalSuccesses++;
    this.successes++;

    if (this.state === "half_open") {
      this.halfOpenSuccesses++;

      if (this.halfOpenSuccesses >= this.halfOpenMax) {
        this.transitionTo("closed");
      }
    } else if (this.state === "closed") {
      // Reset consecutive failures on success
      this.consecutiveFailures = 0;
    }
  }

  private onFailure(error: unknown): void {
    this.totalFailures++;
    this.consecutiveFailures++;
    this.lastFailureTime = Date.now();

    if (this.state === "half_open") {
      // Any failure in HALF_OPEN immediately re-opens the circuit
      this.transitionTo("open");
    } else if (this.state === "closed") {
      if (this.consecutiveFailures >= this.failureThreshold) {
        this.transitionTo("open");
      }
    }

    log.warn(
      {
        circuit: this.name,
        state: this.state,
        consecutiveFailures: this.consecutiveFailures,
        error,
      },
      "Circuit breaker recorded failure",
    );
  }

  private transitionTo(newState: CircuitState): void {
    const previous = this.state;
    this.state = newState;

    if (newState === "closed") {
      this.consecutiveFailures = 0;
      this.halfOpenSuccesses = 0;
    }

    if (newState === "half_open") {
      this.halfOpenSuccesses = 0;
    }

    log.info(
      { circuit: this.name, from: previous, to: newState },
      "Circuit breaker state transition",
    );

    this.emitEvent(newState, previous);
  }

  private emitEvent(state: CircuitState, previousState?: CircuitState): void {
    this.monitor?.({
      name: this.name,
      state,
      previousState,
      failures: this.consecutiveFailures,
    });
  }
}
