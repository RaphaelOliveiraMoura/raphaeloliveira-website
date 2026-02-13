import { logger } from "../../../lib/logger";
import type { QueueProvider } from "../queue.port";
import { registerCleanupWorkers } from "./cleanup.worker";
import { registerEmailWorker } from "./email.worker";
import { registerWebhookWorker } from "./webhook.worker";

const log = logger.child({ module: "workers" });

/**
 * Register all job workers with the queue provider.
 * Called during app bootstrap after the queue service is initialized.
 */
export function registerWorkers(queue: QueueProvider): void {
  registerEmailWorker(queue);
  registerCleanupWorkers(queue);
  registerWebhookWorker(queue);

  log.info("All workers registered");
}
