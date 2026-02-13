import type { FeatureFlag } from "../../db/schema/feature-flags";
import { container } from "../../lib/container";
import { ConflictError, NotFoundError } from "../../lib/errors";
import { evaluateFlag, type FlagContext } from "../../lib/feature-flags";
import { logger } from "../../lib/logger";
import type { CacheProvider } from "../../services/cache/cache.port";
import { FeatureFlagsRepository } from "./feature-flags.repository";
import type {
  CreateFeatureFlagInput,
  UpdateFeatureFlagInput,
} from "./feature-flags.schemas";

const log = logger.child({ module: "feature-flags" });

/** Cache TTL for all flags (30 seconds). */
const CACHE_TTL = 30;
const CACHE_KEY = "feature-flags:all";

export class FeatureFlagsService {
  private repository = new FeatureFlagsRepository();

  private getCache(): CacheProvider | null {
    try {
      return container.resolve("cache");
    } catch {
      return null;
    }
  }

  /**
   * List all feature flags (admin).
   */
  async listAll(): Promise<FeatureFlag[]> {
    return this.repository.findAll();
  }

  /**
   * Create a new feature flag.
   */
  async create(input: CreateFeatureFlagInput): Promise<FeatureFlag> {
    const existing = await this.repository.findByKey(input.key);
    if (existing) {
      throw new ConflictError("Feature flag", "key");
    }

    const flag = await this.repository.create({
      key: input.key,
      description: input.description,
      enabled: input.enabled,
      conditions: input.conditions ?? null,
    });

    await this.invalidateCache();
    return flag;
  }

  /**
   * Update a feature flag.
   */
  async update(
    id: string,
    input: UpdateFeatureFlagInput,
  ): Promise<FeatureFlag> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError("Feature Flag", id);

    const updated = await this.repository.update(id, {
      description: input.description,
      enabled: input.enabled,
      conditions: input.conditions,
    });

    if (!updated) throw new NotFoundError("Feature Flag", id);

    await this.invalidateCache();
    return updated;
  }

  /**
   * Delete a feature flag.
   */
  async delete(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError("Feature Flag", id);

    await this.repository.delete(id);
    await this.invalidateCache();
  }

  /**
   * Evaluate all flags for a user context.
   * Returns a map of flag key → boolean.
   */
  async evaluateAll(context: FlagContext): Promise<Record<string, boolean>> {
    const flags = await this.getAllCached();
    const result: Record<string, boolean> = {};

    for (const flag of flags) {
      result[flag.key] = evaluateFlag(flag, context);
    }

    return result;
  }

  /**
   * Check if a specific flag is enabled for a context.
   */
  async isEnabled(key: string, context: FlagContext): Promise<boolean> {
    const flags = await this.getAllCached();
    const flag = flags.find((f) => f.key === key);
    if (!flag) return false;
    return evaluateFlag(flag, context);
  }

  private async getAllCached(): Promise<FeatureFlag[]> {
    const cache = this.getCache();

    if (cache) {
      const cached = await cache.get<FeatureFlag[]>(CACHE_KEY);
      if (cached) return cached;
    }

    const flags = await this.repository.findAll();

    if (cache) {
      await cache.set(CACHE_KEY, flags, CACHE_TTL);
    }

    return flags;
  }

  private async invalidateCache(): Promise<void> {
    const cache = this.getCache();
    if (cache) {
      await cache.del(CACHE_KEY);
      log.debug("Feature flags cache invalidated");
    }
  }
}
