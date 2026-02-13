import Redis from "ioredis";

import { logger } from "../../lib/logger";
import type { CacheProvider } from "./cache.port";

const log = logger.child({ module: "cache:redis" });

/**
 * Redis cache adapter using ioredis.
 *
 * Production-grade adapter with support for TTL, pattern deletion,
 * and connection health checks.
 */
export class RedisCacheAdapter implements CacheProvider {
  private client: Redis;

  constructor(redisUrl: string) {
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        const delay = Math.min(times * 200, 5000);
        return delay;
      },
      lazyConnect: true,
    });

    this.client.on("error", (err: Error) => {
      log.error({ error: err }, "Redis cache connection error");
    });

    this.client.on("connect", () => {
      log.info("Redis cache connected");
    });
  }

  /**
   * Ensure the Redis client is connected.
   * Called lazily on first operation.
   */
  private async ensureConnected(): Promise<void> {
    if (this.client.status === "wait") {
      await this.client.connect();
    }
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    await this.ensureConnected();
    const raw = await this.client.get(key);
    if (raw === null) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as T;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    await this.ensureConnected();
    const serialized = JSON.stringify(value);

    if (ttlSeconds !== undefined) {
      await this.client.setex(key, ttlSeconds, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.ensureConnected();
    await this.client.del(key);
  }

  async has(key: string): Promise<boolean> {
    await this.ensureConnected();
    const exists = await this.client.exists(key);
    return exists === 1;
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
    await this.ensureConnected();

    let cursor = "0";
    do {
      const [nextCursor, keys] = await this.client.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100,
      );
      cursor = nextCursor;

      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } while (cursor !== "0");
  }

  async flush(): Promise<void> {
    await this.ensureConnected();
    await this.client.flushdb();
  }

  async verify(): Promise<boolean> {
    try {
      await this.ensureConnected();
      const result = await this.client.ping();
      return result === "PONG";
    } catch {
      return false;
    }
  }

  async close(): Promise<void> {
    await this.client.quit();
    log.info("Redis cache connection closed");
  }

  /**
   * Get the underlying ioredis client instance.
   * Useful for BullMQ or other libraries that need a raw Redis connection.
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * Get the Redis URL for creating additional connections.
   */
  getRedisUrl(): string {
    const { host, port, username, password, db } = this.client.options;
    const auth = password ? `${username || ""}:${password}@` : "";
    return `redis://${auth}${host}:${port}/${db || 0}`;
  }
}
