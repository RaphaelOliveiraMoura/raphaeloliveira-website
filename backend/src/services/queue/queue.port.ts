/**
 * Options for adding a job to the queue.
 */
export interface JobOptions {
  /** Unique job ID (prevents duplicates). */
  jobId?: string;
  /** Number of retry attempts on failure (default: 3). */
  attempts?: number;
  /** Backoff strategy for retries. */
  backoff?: {
    type: "fixed" | "exponential";
    delay: number; // ms
  };
  /** Job priority (lower = higher priority). */
  priority?: number;
  /** Remove the job from the queue after completion. */
  removeOnComplete?: boolean | number;
  /** Remove the job from the queue after failure. */
  removeOnFail?: boolean | number;
}

/**
 * Job data received by a worker handler.
 */
export interface Job<T = unknown> {
  /** Unique job ID. */
  id: string;
  /** Job name. */
  name: string;
  /** Job data payload. */
  data: T;
  /** Current attempt number (1-based). */
  attemptsMade: number;
}

/**
 * Handler function for processing a job.
 */
export type JobHandler<T = unknown> = (job: Job<T>) => Promise<void>;

/**
 * Queue provider interface (Port).
 *
 * All queue adapters must implement this interface.
 * Services depend only on this contract, never on specific implementations.
 *
 * @example
 * ```ts
 * const queue = container.resolve<QueueProvider>("queue");
 * await queue.add("send-email", { to: "user@example.com", subject: "Hello" });
 *
 * queue.process("send-email", async (job) => {
 *   await sendEmail(job.data);
 * });
 * ```
 */
export interface QueueProvider {
  /**
   * Add a single job to the queue.
   *
   * @returns The job ID.
   */
  add<T = unknown>(name: string, data: T, opts?: JobOptions): Promise<string>;

  /**
   * Add multiple jobs to the queue at once.
   *
   * @returns Array of job IDs.
   */
  addBulk<T = unknown>(
    jobs: Array<{ name: string; data: T; opts?: JobOptions }>,
  ): Promise<string[]>;

  /**
   * Add a delayed job (fires after `delayMs` milliseconds).
   *
   * @returns The job ID.
   */
  schedule<T = unknown>(
    name: string,
    data: T,
    delayMs: number,
    opts?: JobOptions,
  ): Promise<string>;

  /**
   * Add a repeating job using a cron expression.
   *
   * @param name - Job name (also used as the repeatable key)
   * @param data - Job data payload
   * @param cron - Cron expression (e.g. "0 * * * *" for every hour)
   * @param opts - Additional job options
   */
  addCron<T = unknown>(
    name: string,
    data: T,
    cron: string,
    opts?: JobOptions,
  ): Promise<void>;

  /**
   * Register a handler for processing jobs with the given name.
   * Only one handler per job name is allowed.
   */
  process<T = unknown>(name: string, handler: JobHandler<T>): void;

  /**
   * Gracefully close the queue (stop accepting new jobs, drain workers).
   */
  close(): Promise<void>;

  /**
   * Check if the queue provider is reachable.
   */
  verify(): Promise<boolean>;
}
