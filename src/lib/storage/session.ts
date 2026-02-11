import { isClient } from "@/lib/utils/environment";

export function createTypedSessionStorage<
  TMap extends Record<string, unknown>,
>() {
  return {
    get<K extends keyof TMap & string>(key: K): TMap[K] | null {
      if (!isClient()) return null;
      try {
        const raw = sessionStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw) as TMap[K];
      } catch {
        return null;
      }
    },

    set<K extends keyof TMap & string>(key: K, value: TMap[K]): void {
      if (!isClient()) return;
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch {
        // quota exceeded or unavailable
      }
    },

    remove(key: keyof TMap & string): void {
      if (!isClient()) return;
      sessionStorage.removeItem(key);
    },

    clear(): void {
      if (!isClient()) return;
      sessionStorage.clear();
    },
  };
}

export const sessionStore = createTypedSessionStorage();
