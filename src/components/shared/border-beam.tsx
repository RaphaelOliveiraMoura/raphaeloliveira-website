"use client";

import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
}

/**
 * Efeito de "feixe de luz" que percorre a borda de um container.
 * Deve ser usado dentro de um container com `position: relative` e `overflow: hidden`.
 * Inspirado em Magic UI — adaptado para CSS puro (sem dependencia de Framer Motion).
 *
 * Respeita `prefers-reduced-motion` via CSS (animations.css desabilita globalmente).
 */
export function BorderBeam({
  className,
  size = 200,
  duration = 12,
  delay = 0,
  colorFrom = "oklch(0.7 0.15 250)",
  colorTo = "oklch(0.6 0.2 310)",
}: BorderBeamProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        className,
      )}
      style={
        {
          "--border-beam-size": `${size}px`,
          "--border-beam-duration": `${duration}s`,
          "--border-beam-delay": `${delay}s`,
          "--border-beam-color-from": colorFrom,
          "--border-beam-color-to": colorTo,
        } as React.CSSProperties
      }
    >
      <div className="absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#fff,#fff)]">
        <div
          className="absolute -inset-px animate-border-beam rounded-[inherit]"
          style={{
            background: `conic-gradient(from calc(var(--border-beam-angle, 0) * 1deg), transparent 0%, var(--border-beam-color-from) 10%, var(--border-beam-color-to) 20%, transparent 30%)`,
          }}
        />
      </div>
    </div>
  );
}
