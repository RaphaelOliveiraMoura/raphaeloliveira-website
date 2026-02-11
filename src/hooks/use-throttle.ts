"use client";

import { useCallback, useRef } from "react";

export function useThrottle<T extends (...args: never[]) => unknown>(
  fn: T,
  delayMs: number,
): T {
  const lastCall = useRef(0);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current >= delayMs) {
        lastCall.current = now;
        return fn(...args);
      }
    },
    [fn, delayMs],
  ) as T;
}
