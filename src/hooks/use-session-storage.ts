"use client";

import { useCallback, useSyncExternalStore } from "react";

const SESSION_STORAGE_EVENT = "core-stack-session-storage";

function dispatchSessionEvent(key: string) {
  window.dispatchEvent(
    new CustomEvent(SESSION_STORAGE_EVENT, { detail: key })
  );
}

export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const subscribe = useCallback(
    (callback: () => void) => {
      const handleCustom = (e: Event) => {
        if ((e as CustomEvent).detail === key) callback();
      };
      window.addEventListener(SESSION_STORAGE_EVENT, handleCustom);
      return () => {
        window.removeEventListener(SESSION_STORAGE_EVENT, handleCustom);
      };
    },
    [key]
  );

  const getSnapshot = useCallback(() => {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }, [key]);

  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const storedValue: T = raw !== null ? (JSON.parse(raw) as T) : initialValue;

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const currentRaw = window.sessionStorage.getItem(key);
        const current: T =
          currentRaw !== null
            ? (JSON.parse(currentRaw) as T)
            : initialValue;
        const newValue = value instanceof Function ? value(current) : value;
        window.sessionStorage.setItem(key, JSON.stringify(newValue));
        dispatchSessionEvent(key);
      } catch {
        // sessionStorage indisponivel
      }
    },
    [key, initialValue]
  );

  const removeValue = useCallback(() => {
    try {
      window.sessionStorage.removeItem(key);
      dispatchSessionEvent(key);
    } catch {
      // sessionStorage indisponivel
    }
  }, [key]);

  return [storedValue, setValue, removeValue];
}
