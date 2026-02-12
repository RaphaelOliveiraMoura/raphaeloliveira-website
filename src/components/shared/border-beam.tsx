"use client";

import { cn } from "@/lib/utils";

interface BorderBeamProps {
  /** Largura angular do feixe como porcentagem do circulo (1-50). Default: 10 */
  size?: number;
  /** Duracao de um ciclo completo em segundos */
  duration?: number;
  /** Delay antes de iniciar a animacao em segundos */
  delay?: number;
  /** Cor inicial do gradiente do feixe */
  colorFrom?: string;
  /** Cor final do gradiente do feixe */
  colorTo?: string;
  /** Classes CSS adicionais para o elemento rotativo */
  className?: string;
  /** Estilos inline adicionais */
  style?: React.CSSProperties;
  /** Inverter a direcao da animacao */
  reverse?: boolean;
  /** Espessura da borda em pixels */
  borderWidth?: number;
}

/**
 * Efeito de "feixe de luz" que percorre a borda de um container.
 * Deve ser usado dentro de um container com `position: relative`.
 *
 * Usa `conic-gradient` + `transform: rotate()` (GPU-composited) para
 * garantir animacao fluida independente de carga na main thread.
 * A mascara CSS recorta o gradiente rotativo para exibir apenas a borda.
 *
 * Respeita `prefers-reduced-motion` via CSS (animations.css desabilita globalmente).
 */
export function BorderBeam({
  className,
  size = 10,
  delay = 0,
  duration = 6,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  style,
  reverse = false,
  borderWidth = 1.5,
}: BorderBeamProps) {
  const arc = Math.max(1, Math.min(size, 50));

  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[inherit] border-(length:--border-beam-width) border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]"
      style={
        {
          "--border-beam-width": `${borderWidth}px`,
        } as React.CSSProperties
      }
    >
      <div
        className={cn(
          "absolute inset-[-100%] animate-border-beam-rotate",
          className,
        )}
        style={
          {
            background: `conic-gradient(from 0deg at 50% 50%, transparent 0%, ${colorFrom} ${arc * 0.3}%, ${colorTo} ${arc * 0.6}%, transparent ${arc}%)`,
            animationDuration: `${duration}s`,
            animationDelay: `${-delay}s`,
            animationDirection: reverse ? "reverse" : "normal",
            ...style,
          } as React.CSSProperties
        }
      />
    </div>
  );
}
