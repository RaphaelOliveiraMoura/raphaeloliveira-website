import { and, count, desc, eq, isNotNull, isNull } from "drizzle-orm";

import { db } from "../../db/index";
import type {
  NewNotification,
  NewNotificationPreference,
  Notification,
  NotificationPreference,
} from "../../db/schema/notifications";
import {
  notificationPreferences,
  notifications,
} from "../../db/schema/notifications";

export class NotificationsRepository {
  // ---- Notifications ----

  async create(data: NewNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(data)
      .returning();
    return notification!;
  }

  async findByUserId(
    userId: string,
    options: {
      offset: number;
      limit: number;
      status: "all" | "read" | "unread";
    },
  ): Promise<{ data: Notification[]; total: number }> {
    const conditions = [eq(notifications.userId, userId)];

    if (options.status === "read") {
      conditions.push(isNotNull(notifications.readAt));
    } else if (options.status === "unread") {
      conditions.push(isNull(notifications.readAt));
    }

    const where = and(...conditions);

    const [data, countResult] = await Promise.all([
      db
        .select()
        .from(notifications)
        .where(where)
        .orderBy(desc(notifications.createdAt))
        .limit(options.limit)
        .offset(options.offset),
      db.select({ count: count() }).from(notifications).where(where),
    ]);

    return { data, total: countResult[0]?.count ?? 0 };
  }

  async unreadCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(eq(notifications.userId, userId), isNull(notifications.readAt)),
      );
    return result?.count ?? 0;
  }

  async markAsRead(id: string, userId: string): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning({ id: notifications.id });
    return result.length > 0;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(eq(notifications.userId, userId), isNull(notifications.readAt)),
      )
      .returning({ id: notifications.id });
    return result.length;
  }

  async deleteNotification(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning({ id: notifications.id });
    return result.length > 0;
  }

  // ---- Preferences ----

  async getPreferences(userId: string): Promise<NotificationPreference[]> {
    return db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));
  }

  async upsertPreference(
    data: NewNotificationPreference,
  ): Promise<NotificationPreference> {
    const [pref] = await db
      .insert(notificationPreferences)
      .values(data)
      .onConflictDoUpdate({
        target: [
          notificationPreferences.userId,
          notificationPreferences.channel,
        ],
        set: { inApp: data.inApp, email: data.email },
      })
      .returning();
    return pref!;
  }
}
