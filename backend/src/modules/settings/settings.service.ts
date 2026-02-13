import type { Setting } from "../../db/schema/settings";
import { SettingsRepository } from "./settings.repository";
import type { UpdateSettingsInput } from "./settings.schemas";

export interface MergedSetting {
  key: string;
  value: unknown;
  source: "system" | "user";
  updatedAt: string;
}

export class SettingsService {
  private repository = new SettingsRepository();

  /**
   * Get user settings merged with system defaults.
   * User settings override system settings with the same key.
   */
  async getUserSettingsMerged(userId: string): Promise<MergedSetting[]> {
    const [systemSettings, userSettings] = await Promise.all([
      this.repository.getSystemSettings(),
      this.repository.getUserSettings(userId),
    ]);

    const userMap = new Map(userSettings.map((s) => [s.key, s]));
    const result: MergedSetting[] = [];

    // Add all system settings (overridden by user if exists)
    for (const sys of systemSettings) {
      const userOverride = userMap.get(sys.key);
      if (userOverride) {
        result.push({
          key: userOverride.key,
          value: userOverride.value,
          source: "user",
          updatedAt: userOverride.updatedAt.toISOString(),
        });
        userMap.delete(sys.key);
      } else {
        result.push({
          key: sys.key,
          value: sys.value,
          source: "system",
          updatedAt: sys.updatedAt.toISOString(),
        });
      }
    }

    // Add remaining user-only settings
    for (const user of userMap.values()) {
      result.push({
        key: user.key,
        value: user.value,
        source: "user",
        updatedAt: user.updatedAt.toISOString(),
      });
    }

    return result;
  }

  /**
   * Update user settings (batch upsert).
   */
  async updateUserSettings(
    userId: string,
    entries: UpdateSettingsInput,
  ): Promise<Setting[]> {
    const results: Setting[] = [];
    for (const entry of entries) {
      const setting = await this.repository.upsert({
        scope: "user",
        scopeId: userId,
        key: entry.key,
        value: entry.value,
      });
      results.push(setting);
    }
    return results;
  }

  /**
   * Get system settings.
   */
  async getSystemSettings(): Promise<MergedSetting[]> {
    const systemSettings = await this.repository.getSystemSettings();
    return systemSettings.map((s) => ({
      key: s.key,
      value: s.value,
      source: "system" as const,
      updatedAt: s.updatedAt.toISOString(),
    }));
  }

  /**
   * Update system settings (batch upsert).
   */
  async updateSystemSettings(entries: UpdateSettingsInput): Promise<Setting[]> {
    const results: Setting[] = [];
    for (const entry of entries) {
      const setting = await this.repository.upsert({
        scope: "system",
        scopeId: null,
        key: entry.key,
        value: entry.value,
      });
      results.push(setting);
    }
    return results;
  }
}
