import { createHmac } from "node:crypto";

import { eq } from "drizzle-orm";

import { db } from "../../../db/index";
import { logger } from "../../../lib/logger";
import type { QueueProvider } from "../queue.port";

const log = logger.child({ module: "worker:webhook" });

export interface WebhookDeliveryJobData {
  deliveryId: string;
  url: string;
  secret: string;
  event: string;
  payload: unknown;
  attempt: number;
}

/** Retry delays in ms: 1min, 5min, 30min, 2h, 24h */
const RETRY_DELAYS = [60_000, 300_000, 1_800_000, 7_200_000, 86_400_000];

/**
 * Sign a webhook payload with HMAC-SHA256.
 */
function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Register the webhook delivery worker.
 * Sends webhook payloads to registered URLs with retry and HMAC signing.
 */
export function registerWebhookWorker(queue: QueueProvider): void {
  queue.process<WebhookDeliveryJobData>("webhook:deliver", async (job) => {
    const { deliveryId, url, secret, event, payload, attempt } = job.data;

    log.debug(
      { jobId: job.id, deliveryId, url, event, attempt },
      "Processing webhook delivery",
    );

    const body = JSON.stringify(payload);
    const signature = signPayload(body, secret);
    const timestamp = Date.now().toString();

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Event": event,
          "X-Webhook-Signature": `sha256=${signature}`,
          "X-Webhook-Timestamp": timestamp,
          "X-Webhook-Delivery": deliveryId,
          "User-Agent": "CoreStack-Webhooks/1.0",
        },
        body,
        signal: AbortSignal.timeout(30_000), // 30s timeout
      });

      // Update delivery record
      try {
        const { webhookDeliveries } =
          await import("../../../db/schema/webhooks");
        const responseBody = await response.text().catch(() => "");

        if (response.ok) {
          await db
            .update(webhookDeliveries)
            .set({
              statusCode: response.status,
              responseBody: responseBody.slice(0, 2048),
              attempts: attempt,
              deliveredAt: new Date(),
            })
            .where(eq(webhookDeliveries.id, deliveryId));

          log.info(
            { deliveryId, status: response.status },
            "Webhook delivered",
          );
        } else {
          // Non-2xx response: schedule retry
          await db
            .update(webhookDeliveries)
            .set({
              statusCode: response.status,
              responseBody: responseBody.slice(0, 2048),
              attempts: attempt,
              nextRetryAt: getNextRetryTime(attempt),
            })
            .where(eq(webhookDeliveries.id, deliveryId));

          throw new Error(
            `Webhook returned ${response.status}: ${responseBody.slice(0, 200)}`,
          );
        }
      } catch (err) {
        // If we can't import the schema, just throw the original error
        if (
          err instanceof Error &&
          err.message.startsWith("Webhook returned")
        ) {
          throw err;
        }
        log.warn({ error: err }, "Could not update webhook delivery record");
      }
    } catch (err) {
      log.error(
        { deliveryId, url, error: err, attempt },
        "Webhook delivery failed",
      );

      // Schedule retry if we haven't exhausted retries
      if (attempt < RETRY_DELAYS.length) {
        const delay = RETRY_DELAYS[attempt] ?? RETRY_DELAYS.at(-1)!;
        await queue.schedule(
          "webhook:deliver",
          { ...job.data, attempt: attempt + 1 },
          delay,
        );
        log.debug(
          { deliveryId, nextAttempt: attempt + 1, delay },
          "Webhook retry scheduled",
        );
      } else {
        // Mark as permanently failed
        try {
          const { webhookDeliveries } =
            await import("../../../db/schema/webhooks");
          await db
            .update(webhookDeliveries)
            .set({ failedAt: new Date(), attempts: attempt })
            .where(eq(webhookDeliveries.id, deliveryId));
        } catch {
          // Schema not available
        }
        log.error(
          { deliveryId },
          "Webhook delivery permanently failed after all retries",
        );
      }
    }
  });
}

function getNextRetryTime(attempt: number): Date | null {
  const delay = RETRY_DELAYS[attempt];
  if (delay === undefined) return null;
  return new Date(Date.now() + delay);
}
