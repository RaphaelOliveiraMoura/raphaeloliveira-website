/**
 * Cache provider interface (Port).
 *
 * All cache adapters must implement this interface.
 * Services depend only on this contract, never on specific implementations.
 *
 * @example
 * ```ts
 * const cache = container.resolve<CacheProvider>("cache");
 * await cache.set("user:123", userData, 300); // 5 min TTL
 * const user = await cache.get<User>("user:123");
 * ```
 */
export interface CacheProvider {
  /**
   * Get a value by key. Returns `null` if not found or expired.
   */
  get<T = unknown>(key: string): Promise<T | null>;

  /**
   * Set a value with an optional TTL (in seconds).
   * If no TTL is provided, the value is stored indefinitely.
   */
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;

  /**
   * Delete a value by key.
   */
  del(key: string): Promise<void>;

  /**
   * Check if a key exists and is not expired.
   */
  has(key: string): Promise<boolean>;

  /**
   * Get a value, or compute and cache it if not present.
   * Avoids cache stampede by only running the factory once.
   *
   * @param key - Cache key
   * @param factory - Function that produces the value if cache miss
   * @param ttlSeconds - Optional TTL for the cached value
   */
  getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds?: number,
  ): Promise<T>;

  /**
   * Delete all keys matching a glob pattern.
   *
   * @param pattern - Glob pattern (e.g. `"user:*"`, `"roles:*"`)
   */
  delByPattern(pattern: string): Promise<void>;

  /**
   * Delete all keys (flush the entire cache).
   */
  flush(): Promise<void>;

  /**
   * Check if the cache provider is reachable.
   */
  verify(): Promise<boolean>;

  /**
   * Gracefully close the connection (if applicable).
   */
  close(): Promise<void>;
}
