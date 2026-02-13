import { domainEvents } from "../../lib/events";
import { logger } from "../../lib/logger";
import { WebhooksService } from "./webhooks.service";

const log = logger.child({ module: "webhooks:listener" });

const webhooksService = new WebhooksService();

/**
 * Register domain event listeners that dispatch webhook deliveries.
 * Called during app bootstrap.
 */
export function registerWebhookListeners(): void {
  const eventsToForward = [
    "user.created",
    "user.updated",
    "user.deleted",
    "auth.login",
    "auth.logout",
    "auth.password.reset.completed",
    "auth.email.verified",
  ] as const;

  for (const eventName of eventsToForward) {
    domainEvents.on(eventName, async (payload) => {
      try {
        await webhooksService.dispatchEvent(eventName, payload);
      } catch (err) {
        log.error(
          { error: err, event: eventName },
          "Failed to dispatch webhook event",
        );
      }
    });
  }

  log.info("Webhook listeners registered");
}
