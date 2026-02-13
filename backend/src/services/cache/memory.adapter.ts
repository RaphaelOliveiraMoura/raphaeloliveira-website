import { logger } from "../../lib/logger";
import type { CacheProvider } from "./cache.port";

const log = logger.child({ module: "cache:memory" });

interface CacheEntry {
  value: string;
  expiresAt: number | null; // Unix timestamp in ms, null = no expiry
}

/**
 * In-memory cache adapter for development and testing.
 *
 * Uses a `Map` with TTL-based expiration. Not suitable for
 * multi-process or production environments.
 */
export class MemoryCacheAdapter implements CacheProvider {
  private store = new Map<string, CacheEntry>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  async get<T = unknown>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.clearTimer(key);
      return null;
    }

    return JSON.parse(entry.value) as T;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const expiresAt =
      ttlSeconds !== undefined ? Date.now() + ttlSeconds * 1000 : null;

    this.store.set(key, {
      value: JSON.stringify(value),
      expiresAt,
    });

    // Auto-cleanup expired keys
    this.clearTimer(key);
    if (ttlSeconds !== undefined) {
      const timer = setTimeout(() => {
        this.store.delete(key);
        this.timers.delete(key);
      }, ttlSeconds * 1000);
      timer.unref();
      this.timers.set(key, timer);
    }
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
    this.clearTimer(key);
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await factory();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  async delByPattern(pattern: string): Promise<void> {
    const regex = new RegExp(
      "^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$",
    );

    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        this.clearTimer(key);
      }
    }
  }

  async flush(): Promise<void> {
    this.store.clear();
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }

  async verify(): Promise<boolean> {
    return true;
  }

  async close(): Promise<void> {
    await this.flush();
    log.info("Memory cache closed");
  }

  private clearTimer(key: string): void {
    const existing = this.timers.get(key);
    if (existing) {
      clearTimeout(existing);
      this.timers.delete(key);
    }
  }
}
