interface StorageItem<T> {
  value: T;
  expiry?: number;
}

import { isClient } from "@/lib/utils/environment";

export function createTypedLocalStorage<
  TMap extends Record<string, unknown>,
>() {
  return {
    get<K extends keyof TMap & string>(key: K): TMap[K] | null {
      if (!isClient()) return null;
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw) as TMap[K];
      } catch {
        return null;
      }
    },

    set<K extends keyof TMap & string>(key: K, value: TMap[K]): void {
      if (!isClient()) return;
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // quota exceeded or unavailable
      }
    },

    remove(key: keyof TMap & string): void {
      if (!isClient()) return;
      localStorage.removeItem(key);
    },

    setWithExpiry<K extends keyof TMap & string>(
      key: K,
      value: TMap[K],
      ttlMs: number,
    ): void {
      if (!isClient()) return;
      const item: StorageItem<TMap[K]> = {
        value,
        expiry: Date.now() + ttlMs,
      };
      try {
        localStorage.setItem(key, JSON.stringify(item));
      } catch {
        // quota exceeded or unavailable
      }
    },

    getWithExpiry<K extends keyof TMap & string>(key: K): TMap[K] | null {
      if (!isClient()) return null;
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const item = JSON.parse(raw) as StorageItem<TMap[K]>;
        if (item.expiry && Date.now() > item.expiry) {
          localStorage.removeItem(key);
          return null;
        }
        return item.value;
      } catch {
        return null;
      }
    },

    clear(): void {
      if (!isClient()) return;
      localStorage.clear();
    },
  };
}

export const storage = createTypedLocalStorage();
