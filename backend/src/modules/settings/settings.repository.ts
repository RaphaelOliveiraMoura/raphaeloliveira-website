import { and, eq, isNull } from "drizzle-orm";

import { db } from "../../db/index";
import type { Setting } from "../../db/schema/settings";
import { settings } from "../../db/schema/settings";

export class SettingsRepository {
  /**
   * Get all system settings.
   */
  async getSystemSettings(): Promise<Setting[]> {
    return db
      .select()
      .from(settings)
      .where(and(eq(settings.scope, "system"), isNull(settings.scopeId)));
  }

  /**
   * Get all user settings.
   */
  async getUserSettings(userId: string): Promise<Setting[]> {
    return db
      .select()
      .from(settings)
      .where(and(eq(settings.scope, "user"), eq(settings.scopeId, userId)));
  }

  /**
   * Upsert a setting (insert or update on conflict).
   */
  async upsert(data: {
    scope: string;
    scopeId: string | null;
    key: string;
    value: unknown;
  }): Promise<Setting> {
    const [result] = await db
      .insert(settings)
      .values({
        scope: data.scope,
        scopeId: data.scopeId,
        key: data.key,
        value: data.value,
      })
      .onConflictDoUpdate({
        target: [settings.scope, settings.scopeId, settings.key],
        set: { value: data.value },
      })
      .returning();
    return result!;
  }

  /**
   * Delete a setting by scope, scopeId, and key.
   */
  async delete(
    scope: string,
    scopeId: string | null,
    key: string,
  ): Promise<boolean> {
    const conditions = [eq(settings.scope, scope), eq(settings.key, key)];
    if (scopeId) {
      conditions.push(eq(settings.scopeId, scopeId));
    } else {
      conditions.push(isNull(settings.scopeId));
    }

    const result = await db
      .delete(settings)
      .where(and(...conditions))
      .returning({ id: settings.id });
    return result.length > 0;
  }
}
