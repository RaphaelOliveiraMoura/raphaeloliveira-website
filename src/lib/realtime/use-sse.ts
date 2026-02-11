"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SSEEventHandler = (event: MessageEvent) => void;

interface UseSSEOptions {
  onMessage?: SSEEventHandler;
  onOpen?: () => void;
  onError?: (event: Event) => void;
}

export function useSSE(url: string, options: UseSSEOptions = {}) {
  const { onMessage, onOpen, onError } = options;
  const eventSourceRef = useRef<EventSource | null>(null);
  const [lastEvent, setLastEvent] = useState<MessageEvent | null>(null);

  useEffect(() => {
    if (typeof url !== "string" || !url) return;

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      onOpen?.();
    };

    eventSource.onmessage = (event) => {
      setLastEvent(event);
      onMessage?.(event);
    };

    eventSource.onerror = (event) => {
      onError?.(event);
      eventSource.close();
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [url, onMessage, onOpen, onError]);

  const close = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
  }, []);

  return { lastEvent, close };
}
