import type { ConnectionOptions } from "bullmq";
import { Queue, Worker } from "bullmq";

import { logger } from "../../lib/logger";
import type { Job, JobHandler, JobOptions, QueueProvider } from "./queue.port";

const log = logger.child({ module: "queue:bullmq" });

/** Default queue name for all jobs. */
const QUEUE_NAME = "corestack";

/**
 * BullMQ queue adapter for production use.
 *
 * Uses Redis as the backing store. Supports retries, backoff,
 * cron scheduling, priority, and dead letter queues.
 */
export class BullMQAdapter implements QueueProvider {
  private queue: Queue;
  private workers: Worker[] = [];
  private connection: ConnectionOptions;

  constructor(redisUrl: string) {
    this.connection = { url: redisUrl };

    this.queue = new Queue(QUEUE_NAME, {
      connection: this.connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      },
    });

    this.queue.on("error", (err) => {
      log.error({ error: err }, "BullMQ queue error");
    });
  }

  async add<T = unknown>(
    name: string,
    data: T,
    opts?: JobOptions,
  ): Promise<string> {
    const job = await this.queue.add(name, data, this.mapOptions(opts));
    return job.id ?? name;
  }

  async addBulk<T = unknown>(
    jobs: Array<{ name: string; data: T; opts?: JobOptions }>,
  ): Promise<string[]> {
    const results = await this.queue.addBulk(
      jobs.map((j) => ({
        name: j.name,
        data: j.data,
        opts: this.mapOptions(j.opts),
      })),
    );
    return results.map((r) => r.id ?? r.name);
  }

  async schedule<T = unknown>(
    name: string,
    data: T,
    delayMs: number,
    opts?: JobOptions,
  ): Promise<string> {
    const job = await this.queue.add(name, data, {
      ...this.mapOptions(opts),
      delay: delayMs,
    });
    return job.id ?? name;
  }

  async addCron<T = unknown>(
    name: string,
    data: T,
    cron: string,
    opts?: JobOptions,
  ): Promise<void> {
    await this.queue.upsertJobScheduler(
      name,
      { pattern: cron },
      {
        name,
        data: data as Record<string, unknown>,
        opts: this.mapOptions(opts),
      },
    );

    log.info({ name, cron }, "Cron job registered");
  }

  process<T = unknown>(name: string, handler: JobHandler<T>): void {
    const worker = new Worker(
      QUEUE_NAME,
      async (bullJob) => {
        if (bullJob.name !== name) return;

        const job: Job<T> = {
          id: bullJob.id ?? bullJob.name,
          name: bullJob.name,
          data: bullJob.data as T,
          attemptsMade: bullJob.attemptsMade,
        };

        await handler(job);
      },
      {
        connection: this.connection,
        concurrency: 5,
      },
    );

    worker.on("completed", (job) => {
      log.debug({ jobId: job.id, name: job.name }, "Job completed");
    });

    worker.on("failed", (job, err) => {
      log.error({ jobId: job?.id, name: job?.name, error: err }, "Job failed");
    });

    worker.on("error", (err) => {
      log.error({ error: err }, "BullMQ worker error");
    });

    this.workers.push(worker);
    log.info({ name }, "Worker registered for job");
  }

  async close(): Promise<void> {
    // Close all workers first
    await Promise.all(this.workers.map((w) => w.close()));
    // Then close the queue
    await this.queue.close();
    log.info("BullMQ queue closed");
  }

  async verify(): Promise<boolean> {
    try {
      await this.queue.client;
      return true;
    } catch {
      return false;
    }
  }

  private mapOptions(opts?: JobOptions) {
    if (!opts) return undefined;

    return {
      jobId: opts.jobId,
      attempts: opts.attempts,
      backoff: opts.backoff,
      priority: opts.priority,
      removeOnComplete: opts.removeOnComplete,
      removeOnFail: opts.removeOnFail,
    };
  }
}
