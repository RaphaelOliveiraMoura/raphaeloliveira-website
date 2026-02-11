"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** WebSocket readyState: CONNECTING=0, OPEN=1, CLOSING=2, CLOSED=3 */
type ReadyState = 0 | 1 | 2 | 3;

interface UseWebSocketOptions {
  maxRetries?: number;
  retryDelay?: number;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const {
    maxRetries = 5,
    retryDelay = 1000,
    onOpen,
    onClose,
    onError,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const connectRef = useRef<() => void>(() => {});

  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [readyState, setReadyState] = useState<ReadyState>(WebSocket.CLOSED);

  useEffect(() => {
    const connect = () => {
      if (typeof url !== "string" || !url) return;

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        retryCountRef.current = 0;
        setReadyState(ws.readyState as ReadyState);
        onOpen?.();
      };

      ws.onmessage = (event) => {
        setLastMessage(event);
      };

      ws.onclose = (event) => {
        setReadyState(WebSocket.CLOSED);
        onClose?.(event);

        if (retryCountRef.current < maxRetries) {
          const delay = Math.min(
            retryDelay * 2 ** retryCountRef.current,
            30000
          );
          retryCountRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      ws.onerror = (event) => {
        onError?.(event);
      };
    };

    connectRef.current = connect;
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [url, maxRetries, retryDelay, onOpen, onClose, onError]);

  const sendMessage = useCallback(
    (data: string | ArrayBufferLike | Blob) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(data);
      }
    },
    []
  );

  const reconnect = useCallback(() => {
    retryCountRef.current = 0;
    wsRef.current?.close();
    connectRef.current();
  }, []);

  return { lastMessage, sendMessage, readyState, reconnect };
}
