"use client";

import { cn } from "@/lib/utils";

interface AnimatedGradientTextProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Texto com gradiente animado que desliza horizontalmente.
 * Usa o keyframe `gradient-shift` do design system.
 * Inspirado em Magic UI / Aceternity UI.
 *
 * Respeita `prefers-reduced-motion` via CSS (animations.css desabilita globalmente).
 */
export function AnimatedGradientText({
  children,
  className,
}: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        "inline-block bg-gradient-to-r from-primary via-primary/60 to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-shift",
        className,
      )}
    >
      {children}
    </span>
  );
}
