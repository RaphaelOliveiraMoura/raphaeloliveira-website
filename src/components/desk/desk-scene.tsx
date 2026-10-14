"use client";

import { useEffect, useRef } from "react";

import { logger } from "@/lib/telemetry/logger";

import type { DeskContent } from "./desk-content";
import { deskHand, deskSerif } from "./desk-fonts";
import {
  DeskEngine,
  type DeskEngineCallbacks,
  isWebGLAvailable,
} from "./engine/desk-engine";
import type { DeskEngineStrings } from "./engine/scene-kit";

export interface DeskSceneProps {
  content: DeskContent;
  strings: DeskEngineStrings;
  label: string;
  reducedMotion: boolean;
  playIntro: boolean;
  callbacks: DeskEngineCallbacks;
  onEngine: (engine: DeskEngine | null) => void;
  onError: () => void;
}

function readMonoFamily(): string {
  const value = getComputedStyle(document.body)
    .getPropertyValue("--font-geist-mono")
    .trim();
  return value || "ui-monospace, monospace";
}

/** `?hour=7.5` mostra a mesa como se fossem 7h30 em BH. */
function readHourOverride(): number | null {
  const raw = new URLSearchParams(window.location.search).get("hour");
  const hour = raw === null ? Number.NaN : Number(raw);
  return Number.isFinite(hour) ? ((hour % 24) + 24) % 24 : null;
}

/** Canvas WebGL da mesa. Carregado só no cliente (three.js fica fora do SSR). */
export default function DeskScene({
  content,
  strings,
  label,
  reducedMotion,
  playIntro,
  callbacks,
  onEngine,
  onError,
}: DeskSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef(callbacks);
  const handlersRef = useRef({ onEngine, onError });
  const initRef = useRef({ content, strings, reducedMotion, playIntro });

  useEffect(() => {
    callbacksRef.current = callbacks;
    handlersRef.current = { onEngine, onError };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!isWebGLAvailable()) {
      handlersRef.current.onError();
      return;
    }
    const init = initRef.current;
    let engine: DeskEngine | null = null;
    try {
      engine = new DeskEngine({
        canvas,
        content: init.content,
        strings: init.strings,
        reducedMotion: init.reducedMotion,
        playIntro: init.playIntro,
        hourOverride: readHourOverride(),
        fonts: {
          serif: deskSerif.style.fontFamily,
          hand: deskHand.style.fontFamily,
          mono: readMonoFamily(),
        },
        // Sempre lê a versão mais recente dos callbacks do React.
        callbacks: {
          onFocusChange: (...args) =>
            callbacksRef.current.onFocusChange(...args),
          onIntroEnd: () => callbacksRef.current.onIntroEnd(),
          onGoal: () => callbacksRef.current.onGoal(),
          onSound: (...args) => callbacksRef.current.onSound(...args),
          onDaylight: (d) => callbacksRef.current.onDaylight(d),
          onLampChange: (on) => callbacksRef.current.onLampChange(on),
        },
      });
      handlersRef.current.onEngine(engine);
    } catch (error) {
      logger.error("Falha ao montar a mesa 3D", { error });
      handlersRef.current.onError();
    }
    return () => {
      handlersRef.current.onEngine(null);
      engine?.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-label={label}
      className="absolute inset-0 block size-full touch-none"
    />
  );
}
