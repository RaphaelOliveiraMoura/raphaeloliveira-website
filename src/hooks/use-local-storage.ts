"use client";

import { useCallback, useSyncExternalStore } from "react";

const LOCAL_STORAGE_EVENT = "core-stack-local-storage";

function dispatchStorageEvent(key: string) {
  window.dispatchEvent(new CustomEvent(LOCAL_STORAGE_EVENT, { detail: key }));
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const subscribe = useCallback(
    (callback: () => void) => {
      const handleStorage = (e: StorageEvent) => {
        if (e.key === key || e.key === null) callback();
      };
      const handleCustom = (e: Event) => {
        if ((e as CustomEvent).detail === key) callback();
      };
      window.addEventListener("storage", handleStorage);
      window.addEventListener(LOCAL_STORAGE_EVENT, handleCustom);
      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener(LOCAL_STORAGE_EVENT, handleCustom);
      };
    },
    [key],
  );

  const getSnapshot = useCallback(() => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }, [key]);

  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const storedValue: T = raw !== null ? (JSON.parse(raw) as T) : initialValue;

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const currentRaw = window.localStorage.getItem(key);
        const current: T =
          currentRaw !== null ? (JSON.parse(currentRaw) as T) : initialValue;
        const newValue = value instanceof Function ? value(current) : value;
        window.localStorage.setItem(key, JSON.stringify(newValue));
        dispatchStorageEvent(key);
      } catch {
        // localStorage indisponivel (quota, SSR)
      }
    },
    [key, initialValue],
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      dispatchStorageEvent(key);
    } catch {
      // localStorage indisponivel
    }
  }, [key]);

  return [storedValue, setValue, removeValue];
}
