"use client";

import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  /**
   * Duracao de um ciclo completo em segundos.
   * @default 40
   */
  duration?: number;
}

/**
 * Scroll horizontal infinito para logo clouds, testimonials e social proof.
 * Duplica o conteudo automaticamente para criar efeito seamless.
 * Inspirado em Magic UI — implementado em CSS puro.
 *
 * Respeita `prefers-reduced-motion` via CSS (animations.css desabilita globalmente).
 */
export function Marquee({
  children,
  className,
  reverse = false,
  pauseOnHover = true,
  duration = 40,
}: MarqueeProps) {
  return (
    <div
      className={cn(
        "group flex gap-[var(--gap)] overflow-hidden [--gap:1rem]",
        className,
      )}
      style={
        {
          "--marquee-duration": `${duration}s`,
        } as React.CSSProperties
      }
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-around gap-[var(--gap)] animate-marquee",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className={cn(
          "flex shrink-0 items-center justify-around gap-[var(--gap)] animate-marquee",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
