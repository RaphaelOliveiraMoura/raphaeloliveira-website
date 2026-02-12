import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createTypedLocalStorage } from "@/lib/storage/local";
import { createTypedSessionStorage } from "@/lib/storage/session";

interface TestMap {
  user: { name: string; age: number };
  theme: string;
}

describe("createTypedLocalStorage", () => {
  const storage = createTypedLocalStorage<TestMap>();

  beforeEach(() => {
    localStorage.clear();
  });

  it("stores and retrieves typed values", () => {
    storage.set("user", { name: "Alice", age: 30 });
    expect(storage.get("user")).toEqual({ name: "Alice", age: 30 });
  });

  it("returns null for missing keys", () => {
    expect(storage.get("user")).toBeNull();
  });

  it("removes keys", () => {
    storage.set("theme", "dark");
    storage.remove("theme");
    expect(storage.get("theme")).toBeNull();
  });

  it("stores with expiry and retrieves within TTL", () => {
    storage.setWithExpiry("theme", "dark", 60000);
    expect(storage.getWithExpiry("theme")).toBe("dark");
  });

  it("returns null for expired items", () => {
    vi.useFakeTimers();
    storage.setWithExpiry("theme", "dark", 1000);
    vi.advanceTimersByTime(2000);
    expect(storage.getWithExpiry("theme")).toBeNull();
    vi.useRealTimers();
  });

  it("clears all items", () => {
    storage.set("user", { name: "Bob", age: 25 });
    storage.set("theme", "light");
    storage.clear();
    expect(storage.get("user")).toBeNull();
    expect(storage.get("theme")).toBeNull();
  });
});

describe("createTypedSessionStorage", () => {
  const storage = createTypedSessionStorage<TestMap>();

  beforeEach(() => {
    sessionStorage.clear();
  });

  it("stores and retrieves typed values", () => {
    storage.set("user", { name: "Alice", age: 30 });
    expect(storage.get("user")).toEqual({ name: "Alice", age: 30 });
  });

  it("returns null for missing keys", () => {
    expect(storage.get("user")).toBeNull();
  });

  it("removes keys", () => {
    storage.set("theme", "dark");
    storage.remove("theme");
    expect(storage.get("theme")).toBeNull();
  });

  it("clears all items", () => {
    storage.set("user", { name: "Bob", age: 25 });
    storage.clear();
    expect(storage.get("user")).toBeNull();
  });
});
