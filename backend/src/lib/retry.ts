import { logger } from "./logger";

const log = logger.child({ module: "retry" });

/**
 * Options for configuring retry behavior.
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3). */
  maxRetries?: number;
  /** Base delay in milliseconds before the first retry (default: 1000). */
  baseDelay?: number;
  /** Maximum delay cap in milliseconds (default: 30000). */
  maxDelay?: number;
  /** Add randomized jitter to prevent thundering herd (default: true). */
  jitter?: boolean;
  /** Predicate to decide if the error is retryable. Defaults to always retry. */
  retryIf?: (error: unknown) => boolean;
  /** AbortSignal to cancel pending retries. */
  signal?: AbortSignal;
  /** Callback invoked before each retry attempt. */
  onRetry?: (attempt: number, error: unknown, delay: number) => void;
}

/**
 * Error thrown when all retry attempts are exhausted.
 */
export class RetryExhaustedError extends Error {
  public readonly attempts: number;
  public readonly lastError: unknown;

  constructor(attempts: number, lastError: unknown) {
    const message =
      lastError instanceof Error ? lastError.message : String(lastError);
    super(`All ${attempts} retry attempts exhausted. Last error: ${message}`);
    this.name = "RetryExhaustedError";
    this.attempts = attempts;
    this.lastError = lastError;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Calculate delay with exponential backoff and optional jitter.
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  jitter: boolean,
): number {
  // Exponential backoff: baseDelay * 2^attempt
  const exponential = baseDelay * 2 ** attempt;
  const capped = Math.min(exponential, maxDelay);

  if (!jitter) return capped;

  // Full jitter: random value between 0 and capped delay
  return Math.floor(Math.random() * capped);
}

/**
 * Sleep for a given duration, respecting an optional AbortSignal.
 */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new Error("Aborted"));
      return;
    }

    const timer = setTimeout(resolve, ms);

    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason ?? new Error("Aborted"));
      },
      { once: true },
    );
  });
}

/**
 * Execute a function with automatic retry and exponential backoff.
 *
 * @example
 * ```ts
 * const result = await withRetry(
 *   () => fetch("https://api.example.com/data"),
 *   {
 *     maxRetries: 3,
 *     baseDelay: 1000,
 *     retryIf: (err) => err instanceof NetworkError,
 *   },
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions,
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  const baseDelay = options?.baseDelay ?? 1000;
  const maxDelay = options?.maxDelay ?? 30_000;
  const jitter = options?.jitter ?? true;
  const retryIf = options?.retryIf ?? (() => true);
  const signal = options?.signal;
  const onRetry = options?.onRetry;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (signal?.aborted) {
        throw signal.reason ?? new Error("Aborted");
      }

      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if this is the last attempt
      if (attempt >= maxRetries) break;

      // Don't retry if the error doesn't match the predicate
      if (!retryIf(error)) break;

      // Don't retry if aborted
      if (signal?.aborted) break;

      const delay = calculateDelay(attempt, baseDelay, maxDelay, jitter);

      log.warn(
        { attempt: attempt + 1, maxRetries, delay, error },
        "Retrying after failure",
      );

      onRetry?.(attempt + 1, error, delay);

      await sleep(delay, signal);
    }
  }

  throw new RetryExhaustedError(maxRetries, lastError);
}
