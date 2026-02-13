import type { QueueProvider } from "../services/queue/queue.port";
import { logger } from "./logger";

const log = logger.child({ module: "scheduler" });

/**
 * Register all scheduled (cron) jobs with the queue provider.
 * Called during app bootstrap after the queue service is initialized.
 *
 * Cron expressions reference:
 * ┌───────────── minute (0 - 59)
 * │ ┌───────────── hour (0 - 23)
 * │ │ ┌───────────── day of month (1 - 31)
 * │ │ │ ┌───────────── month (1 - 12)
 * │ │ │ │ ┌───────────── day of week (0 - 7, 0 and 7 = Sun)
 * │ │ │ │ │
 * * * * * *
 */
export function registerScheduledJobs(queue: QueueProvider): void {
  // ---- Token cleanup (daily at midnight) ----
  queue.addCron("cleanup:expired-tokens", {}, "0 0 * * *");

  // ---- Session cleanup (every hour) ----
  queue.addCron("cleanup:inactive-sessions", {}, "0 * * * *");

  // ---- Idempotency keys cleanup (every 6 hours) ----
  queue.addCron("cleanup:idempotency-keys", {}, "0 */6 * * *");

  log.info("Scheduled jobs registered");
}
