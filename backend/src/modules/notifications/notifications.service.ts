import type { NewNotification } from "../../db/schema/notifications";
import { NotFoundError } from "../../lib/errors";
import { NotificationsRepository } from "./notifications.repository";

export class NotificationsService {
  private repository = new NotificationsRepository();

  /**
   * Create a notification for a user.
   */
  async create(data: Omit<NewNotification, "id">) {
    return this.repository.create(data);
  }

  /**
   * List notifications for a user with filtering.
   */
  async listByUserId(
    userId: string,
    options: {
      page: number;
      limit: number;
      status: "all" | "read" | "unread";
    },
  ) {
    const offset = (options.page - 1) * options.limit;
    return this.repository.findByUserId(userId, {
      offset,
      limit: options.limit,
      status: options.status,
    });
  }

  /**
   * Get unread notification count.
   */
  async unreadCount(userId: string): Promise<number> {
    return this.repository.unreadCount(userId);
  }

  /**
   * Mark a notification as read.
   */
  async markAsRead(id: string, userId: string): Promise<void> {
    const success = await this.repository.markAsRead(id, userId);
    if (!success) throw new NotFoundError("Notification", id);
  }

  /**
   * Mark all notifications as read.
   */
  async markAllAsRead(userId: string): Promise<number> {
    return this.repository.markAllAsRead(userId);
  }

  /**
   * Delete a notification.
   */
  async deleteNotification(id: string, userId: string): Promise<void> {
    const success = await this.repository.deleteNotification(id, userId);
    if (!success) throw new NotFoundError("Notification", id);
  }

  /**
   * Get notification preferences.
   */
  async getPreferences(userId: string) {
    return this.repository.getPreferences(userId);
  }

  /**
   * Update notification preferences.
   */
  async updatePreferences(
    userId: string,
    preferences: Array<{
      channel: string;
      inApp: boolean;
      email: boolean;
    }>,
  ) {
    const results = [];
    for (const pref of preferences) {
      const result = await this.repository.upsertPreference({
        userId,
        channel: pref.channel,
        inApp: pref.inApp,
        email: pref.email,
      });
      results.push(result);
    }
    return results;
  }
}
