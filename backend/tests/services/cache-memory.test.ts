import { afterEach, describe, expect, it } from "vitest";

import { MemoryCacheAdapter } from "../../src/services/cache/memory.adapter";

describe("MemoryCacheAdapter", () => {
  let cache: MemoryCacheAdapter;

  afterEach(async () => {
    await cache.flush();
  });

  it("should return null for non-existent key", async () => {
    cache = new MemoryCacheAdapter();
    expect(await cache.get("missing")).toBeNull();
  });

  it("should set and get a value", async () => {
    cache = new MemoryCacheAdapter();
    await cache.set("key1", { name: "test" });
    const result = await cache.get<{ name: string }>("key1");
    expect(result).toEqual({ name: "test" });
  });

  it("should overwrite existing value", async () => {
    cache = new MemoryCacheAdapter();
    await cache.set("key1", "first");
    await cache.set("key1", "second");
    expect(await cache.get("key1")).toBe("second");
  });

  it("should delete a key", async () => {
    cache = new MemoryCacheAdapter();
    await cache.set("key1", "value");
    await cache.del("key1");
    expect(await cache.get("key1")).toBeNull();
  });

  it("should check if key exists with has()", async () => {
    cache = new MemoryCacheAdapter();
    await cache.set("key1", "value");
    expect(await cache.has("key1")).toBe(true);
    expect(await cache.has("missing")).toBe(false);
  });

  it("should support getOrSet pattern", async () => {
    cache = new MemoryCacheAdapter();
    let callCount = 0;
    const factory = async () => {
      callCount++;
      return { data: "expensive" };
    };

    const result1 = await cache.getOrSet("key1", factory);
    const result2 = await cache.getOrSet("key1", factory);

    expect(result1).toEqual({ data: "expensive" });
    expect(result2).toEqual({ data: "expensive" });
    expect(callCount).toBe(1); // Factory only called once
  });

  it("should delete keys by pattern", async () => {
    cache = new MemoryCacheAdapter();
    await cache.set("user:1:name", "Alice");
    await cache.set("user:1:email", "alice@test.com");
    await cache.set("user:2:name", "Bob");
    await cache.set("other:key", "value");

    await cache.delByPattern("user:1:*");

    expect(await cache.get("user:1:name")).toBeNull();
    expect(await cache.get("user:1:email")).toBeNull();
    expect(await cache.get("user:2:name")).toBe("Bob");
    expect(await cache.get("other:key")).toBe("value");
  });

  it("should flush all keys", async () => {
    cache = new MemoryCacheAdapter();
    await cache.set("a", 1);
    await cache.set("b", 2);
    await cache.flush();
    expect(await cache.has("a")).toBe(false);
    expect(await cache.has("b")).toBe(false);
  });

  it("should expire keys after TTL", async () => {
    cache = new MemoryCacheAdapter();
    // Set with a very short TTL
    await cache.set("short", "value", 0.05); // 50ms

    expect(await cache.get("short")).toBe("value");

    // Wait for expiration
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(await cache.get("short")).toBeNull();
  });

  it("should verify returns true", async () => {
    cache = new MemoryCacheAdapter();
    expect(await cache.verify()).toBe(true);
  });

  it("should handle various data types", async () => {
    cache = new MemoryCacheAdapter();

    await cache.set("string", "hello");
    await cache.set("number", 42);
    await cache.set("boolean", true);
    await cache.set("array", [1, 2, 3]);
    await cache.set("object", { nested: { deep: true } });
    await cache.set("null-val", null);

    expect(await cache.get("string")).toBe("hello");
    expect(await cache.get("number")).toBe(42);
    expect(await cache.get("boolean")).toBe(true);
    expect(await cache.get("array")).toEqual([1, 2, 3]);
    expect(await cache.get("object")).toEqual({ nested: { deep: true } });
    expect(await cache.get("null-val")).toBeNull(); // null stored as JSON null
  });
});
