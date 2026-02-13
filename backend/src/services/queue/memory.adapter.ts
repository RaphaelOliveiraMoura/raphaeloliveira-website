import { randomUUID } from "node:crypto";

import { logger } from "../../lib/logger";
import type { Job, JobHandler, JobOptions, QueueProvider } from "./queue.port";

const log = logger.child({ module: "queue:memory" });

/**
 * In-memory queue adapter for development and testing.
 *
 * Processes jobs synchronously via setTimeout. Not suitable for
 * multi-process or production environments.
 */
export class MemoryQueueAdapter implements QueueProvider {
  private handlers = new Map<string, JobHandler>();
  private timers = new Set<ReturnType<typeof setTimeout>>();
  private closed = false;

  async add<T = unknown>(
    name: string,
    data: T,
    opts?: JobOptions,
  ): Promise<string> {
    const id = opts?.jobId ?? randomUUID();
    this.enqueue({ id, name, data, attemptsMade: 0 }, opts);
    return id;
  }

  async addBulk<T = unknown>(
    jobs: Array<{ name: string; data: T; opts?: JobOptions }>,
  ): Promise<string[]> {
    const ids: string[] = [];
    for (const job of jobs) {
      const id = await this.add(job.name, job.data, job.opts);
      ids.push(id);
    }
    return ids;
  }

  async schedule<T = unknown>(
    name: string,
    data: T,
    delayMs: number,
    opts?: JobOptions,
  ): Promise<string> {
    const id = opts?.jobId ?? randomUUID();
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      this.enqueue({ id, name, data, attemptsMade: 0 }, opts);
    }, delayMs);
    timer.unref();
    this.timers.add(timer);
    return id;
  }

  async addCron<T = unknown>(
    name: string,
    data: T,
    _cron: string,
    _opts?: JobOptions,
  ): Promise<void> {
    // In memory adapter, we skip cron jobs (they would require cron parsing).
    // Log for visibility in dev.
    log.info(
      { name, cron: _cron },
      "Cron job registered (skipped in memory adapter)",
    );
  }

  process<T = unknown>(name: string, handler: JobHandler<T>): void {
    this.handlers.set(name, handler as JobHandler);
    log.debug({ name }, "Worker registered for job");
  }

  async close(): Promise<void> {
    this.closed = true;
    for (const timer of this.timers) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.handlers.clear();
    log.info("Memory queue closed");
  }

  async verify(): Promise<boolean> {
    return !this.closed;
  }

  private enqueue(job: Job, opts?: JobOptions): void {
    if (this.closed) return;

    const handler = this.handlers.get(job.name);
    if (!handler) {
      log.warn({ name: job.name }, "No handler registered for job, dropping");
      return;
    }

    // Execute async in next tick
    const timer = setTimeout(async () => {
      this.timers.delete(timer);
      const maxAttempts = opts?.attempts ?? 3;

      try {
        await handler({ ...job, attemptsMade: job.attemptsMade + 1 });
        log.debug({ jobId: job.id, name: job.name }, "Job completed");
      } catch (err) {
        log.error({ jobId: job.id, name: job.name, error: err }, "Job failed");

        if (job.attemptsMade + 1 < maxAttempts) {
          const delay = opts?.backoff?.delay ?? 1000;
          const retryDelay =
            opts?.backoff?.type === "exponential"
              ? delay * Math.pow(2, job.attemptsMade)
              : delay;

          log.debug(
            { jobId: job.id, retryIn: retryDelay },
            "Scheduling job retry",
          );

          const retryTimer = setTimeout(() => {
            this.timers.delete(retryTimer);
            this.enqueue({ ...job, attemptsMade: job.attemptsMade + 1 }, opts);
          }, retryDelay);
          retryTimer.unref();
          this.timers.add(retryTimer);
        }
      }
    }, 0);
    timer.unref();
    this.timers.add(timer);
  }
}
