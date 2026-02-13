import { randomBytes } from "node:crypto";

import type { Webhook } from "../../db/schema/webhooks";
import { container } from "../../lib/container";
import { ForbiddenError, NotFoundError } from "../../lib/errors";
import { logger } from "../../lib/logger";
import { WebhooksRepository } from "./webhooks.repository";
import type {
  CreateWebhookInput,
  UpdateWebhookInput,
} from "./webhooks.schemas";

const log = logger.child({ module: "webhooks" });

export class WebhooksService {
  private repository = new WebhooksRepository();

  /**
   * Create a new webhook. A random secret is generated for HMAC signing.
   */
  async create(
    userId: string,
    input: CreateWebhookInput,
  ): Promise<Webhook & { secret: string }> {
    const secret = `whsec_${randomBytes(32).toString("hex")}`;

    const webhook = await this.repository.create({
      url: input.url,
      events: input.events,
      secret,
      userId,
      description: input.description,
    });

    return { ...webhook, secret };
  }

  /**
   * List webhooks for a user.
   */
  async listByUserId(userId: string): Promise<Webhook[]> {
    return this.repository.findByUserId(userId);
  }

  /**
   * Update a webhook. Users can only update their own webhooks.
   */
  async update(
    id: string,
    userId: string,
    input: UpdateWebhookInput,
  ): Promise<Webhook> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError("Webhook", id);
    if (existing.userId !== userId) {
      throw new ForbiddenError("You can only update your own webhooks");
    }

    const updated = await this.repository.update(id, {
      url: input.url,
      events: input.events,
      active: input.active,
      description: input.description,
    });

    if (!updated) throw new NotFoundError("Webhook", id);
    return updated;
  }

  /**
   * Delete a webhook. Users can only delete their own webhooks.
   */
  async delete(id: string, userId: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError("Webhook", id);
    if (existing.userId !== userId) {
      throw new ForbiddenError("You can only delete your own webhooks");
    }

    await this.repository.delete(id);
  }

  /**
   * List deliveries for a webhook.
   */
  async listDeliveries(
    webhookId: string,
    userId: string,
    options: { page: number; limit: number },
  ) {
    const webhook = await this.repository.findById(webhookId);
    if (!webhook) throw new NotFoundError("Webhook", webhookId);
    if (webhook.userId !== userId) {
      throw new ForbiddenError("You can only view your own webhook deliveries");
    }

    const offset = (options.page - 1) * options.limit;
    return this.repository.findDeliveriesByWebhookId(webhookId, {
      offset,
      limit: options.limit,
    });
  }

  /**
   * Send a test event to a webhook.
   */
  async sendTestEvent(webhookId: string, userId: string): Promise<void> {
    const webhook = await this.repository.findById(webhookId);
    if (!webhook) throw new NotFoundError("Webhook", webhookId);
    if (webhook.userId !== userId) {
      throw new ForbiddenError("You can only test your own webhooks");
    }

    await this.dispatchEvent("webhook.test", { webhookId, test: true }, [
      webhook,
    ]);
  }

  /**
   * Dispatch a domain event to all webhooks that subscribe to it.
   * Creates delivery records and enqueues jobs for async delivery.
   */
  async dispatchEvent(
    event: string,
    payload: unknown,
    targetWebhooks?: Webhook[],
  ): Promise<void> {
    const activeWebhooks =
      targetWebhooks ?? (await this.repository.findActiveByEvent(event));

    if (activeWebhooks.length === 0) return;

    log.debug(
      { event, webhookCount: activeWebhooks.length },
      "Dispatching webhook event",
    );

    for (const webhook of activeWebhooks) {
      // Create a delivery record
      const delivery = await this.repository.createDelivery({
        webhookId: webhook.id,
        event,
        payload,
        attempts: 0,
      });

      // Enqueue the delivery job
      try {
        const queue = container.resolve("queue");
        await queue.add("webhook:deliver", {
          deliveryId: delivery.id,
          url: webhook.url,
          secret: webhook.secret,
          event,
          payload,
          attempt: 1,
        });
      } catch (err) {
        log.error(
          { error: err, webhookId: webhook.id, deliveryId: delivery.id },
          "Failed to enqueue webhook delivery",
        );
      }
    }
  }
}
