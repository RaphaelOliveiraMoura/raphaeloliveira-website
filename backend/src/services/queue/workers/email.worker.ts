import { container } from "../../../lib/container";
import { logger } from "../../../lib/logger";
import type { SendMailOptions } from "../../mail/mail.port";
import type { QueueProvider } from "../queue.port";

const log = logger.child({ module: "worker:email" });

export interface EmailJobData {
  options: SendMailOptions;
}

/**
 * Register the email sending worker.
 * Offloads email delivery to the background queue to avoid blocking requests.
 */
export function registerEmailWorker(queue: QueueProvider): void {
  queue.process<EmailJobData>("send-email", async (job) => {
    log.debug(
      { jobId: job.id, to: job.data.options.to },
      "Processing email job",
    );

    const mail = container.resolve("mail");
    const result = await mail.send(job.data.options);

    if (!result.success) {
      throw new Error(`Failed to send email to ${String(job.data.options.to)}`);
    }

    log.info(
      { jobId: job.id, messageId: result.messageId },
      "Email sent successfully",
    );
  });
}
