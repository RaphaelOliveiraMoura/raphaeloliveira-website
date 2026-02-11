"use client";

import { useEffect, useRef } from "react";

type EventTarget = Window | Document | HTMLElement | null;

export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: EventTarget,
): void {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const targetElement = element ?? window;
    if (!targetElement?.addEventListener) return;

    const listener = (event: Event) =>
      savedHandler.current(event as WindowEventMap[K]);

    targetElement.addEventListener(eventName, listener);
    return () => targetElement.removeEventListener(eventName, listener);
  }, [eventName, element]);
}
