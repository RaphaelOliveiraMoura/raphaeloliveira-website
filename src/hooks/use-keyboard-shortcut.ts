"use client";

import { useEffect } from "react";

type KeyCombo = string;

function parseKeyCombo(combo: KeyCombo) {
  const parts = combo.toLowerCase().split("+").map((p) => p.trim());
  return {
    ctrl: parts.includes("ctrl") || parts.includes("control"),
    meta: parts.includes("meta") || parts.includes("cmd"),
    alt: parts.includes("alt"),
    shift: parts.includes("shift"),
    key: parts.filter(
      (p) => !["ctrl", "control", "meta", "cmd", "alt", "shift"].includes(p)
    )[0],
  };
}

export function useKeyboardShortcut(
  combo: KeyCombo,
  callback: (event: KeyboardEvent) => void,
  enabled = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const parsed = parseKeyCombo(combo);

    const handler = (event: KeyboardEvent) => {
      const matchesModifiers =
        event.ctrlKey === parsed.ctrl &&
        event.metaKey === parsed.meta &&
        event.altKey === parsed.alt &&
        event.shiftKey === parsed.shift;

      if (matchesModifiers && event.key.toLowerCase() === parsed.key) {
        callback(event);
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [combo, callback, enabled]);
}
