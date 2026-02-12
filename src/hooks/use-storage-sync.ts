"use client";

import { useEffect, useSyncExternalStore } from "react";

type StorageType = "localStorage" | "sessionStorage";

interface StorageSyncOptions {
  /** Tipo de storage (default: localStorage) */
  storage?: StorageType;
  /** Callback quando o valor muda em outra tab */
  onSync?: (newValue: string | null, oldValue: string | null) => void;
}

function getStorage(type: StorageType): Storage | null {
  try {
    return type === "localStorage"
      ? window.localStorage
      : window.sessionStorage;
  } catch {
    return null;
  }
}

/**
 * Hook para sincronizar estado entre tabs via StorageEvent.
 * Diferente de useLocalStorage, este hook e focado em reagir a mudancas
 * de outras tabs e executar side effects (ex: logout quando outra tab deslogar).
 *
 * @example
 * ```tsx
 * // Sincronizar logout entre tabs
 * useStorageSync("core-stack-access-token", {
 *   onSync: (newValue) => {
 *     if (!newValue) logout(); // Token removido em outra tab
 *   },
 * });
 * ```
 */
export function useStorageSync(
  key: string,
  options: StorageSyncOptions = {},
): string | null {
  const { storage: storageType = "localStorage", onSync } = options;

  const subscribe = (callback: () => void) => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key || e.key === null) {
        callback();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  };

  const getSnapshot = () => {
    const store = getStorage(storageType);
    return store?.getItem(key) ?? null;
  };

  const value = useSyncExternalStore(subscribe, getSnapshot, () => null);

  useEffect(() => {
    if (!onSync) return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key === key) {
        onSync(e.newValue, e.oldValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key, onSync]);

  return value;
}
