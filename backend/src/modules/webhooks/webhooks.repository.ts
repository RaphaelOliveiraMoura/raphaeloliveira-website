import { count, desc, eq } from "drizzle-orm";

import { db } from "../../db/index";
import type {
  NewWebhook,
  NewWebhookDelivery,
  Webhook,
  WebhookDelivery,
} from "../../db/schema/webhooks";
import { webhookDeliveries, webhooks } from "../../db/schema/webhooks";

export class WebhooksRepository {
  // ---- Webhooks ----

  async create(data: NewWebhook): Promise<Webhook> {
    const [webhook] = await db.insert(webhooks).values(data).returning();
    return webhook!;
  }

  async findByUserId(userId: string): Promise<Webhook[]> {
    return db
      .select()
      .from(webhooks)
      .where(eq(webhooks.userId, userId))
      .orderBy(desc(webhooks.createdAt));
  }

  async findById(id: string): Promise<Webhook | undefined> {
    const [webhook] = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.id, id))
      .limit(1);
    return webhook;
  }

  async findActiveByEvent(event: string): Promise<Webhook[]> {
    // We need to find webhooks where active=true and events array contains the event.
    // Since events is JSONB, we use a raw SQL approach via drizzle.
    const allActive = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.active, true));

    // Filter in JS since Drizzle doesn't have a built-in JSONB array contains
    return allActive.filter((w) => {
      const events = w.events as string[];
      return events.includes(event) || events.includes("*");
    });
  }

  async update(
    id: string,
    data: Partial<Pick<Webhook, "url" | "events" | "active" | "description">>,
  ): Promise<Webhook | undefined> {
    const [webhook] = await db
      .update(webhooks)
      .set(data)
      .where(eq(webhooks.id, id))
      .returning();
    return webhook;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(webhooks)
      .where(eq(webhooks.id, id))
      .returning({ id: webhooks.id });
    return result.length > 0;
  }

  // ---- Deliveries ----

  async createDelivery(data: NewWebhookDelivery): Promise<WebhookDelivery> {
    const [delivery] = await db
      .insert(webhookDeliveries)
      .values(data)
      .returning();
    return delivery!;
  }

  async findDeliveriesByWebhookId(
    webhookId: string,
    options: { offset: number; limit: number },
  ): Promise<{ data: WebhookDelivery[]; total: number }> {
    const where = eq(webhookDeliveries.webhookId, webhookId);

    const [data, countResult] = await Promise.all([
      db
        .select()
        .from(webhookDeliveries)
        .where(where)
        .orderBy(desc(webhookDeliveries.createdAt))
        .limit(options.limit)
        .offset(options.offset),
      db.select({ count: count() }).from(webhookDeliveries).where(where),
    ]);

    return { data, total: countResult[0]?.count ?? 0 };
  }
}
