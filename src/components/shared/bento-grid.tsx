"use client";

import { cn } from "@/lib/utils";

/* ===========================
   BentoGrid - Container
   =========================== */

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Layout de grid asimetrico estilo "bento box" para features e destaques.
 * Inspirado em Apple e Magic UI.
 *
 * Usar `BentoCard` como children, controlando `colSpan` e `rowSpan` para variar tamanhos.
 */
export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid auto-rows-[minmax(180px,1fr)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ===========================
   BentoCard - Item
   =========================== */

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Numero de colunas que o card ocupa (1-3).
   * @default 1
   */
  colSpan?: 1 | 2 | 3;
  /**
   * Numero de linhas que o card ocupa (1-2).
   * @default 1
   */
  rowSpan?: 1 | 2;
}

const colSpanClasses = {
  1: "",
  2: "sm:col-span-2",
  3: "sm:col-span-2 lg:col-span-3",
} as const;

const rowSpanClasses = {
  1: "",
  2: "row-span-2",
} as const;

export function BentoCard({
  children,
  className,
  colSpan = 1,
  rowSpan = 1,
}: BentoCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card p-6 transition-all duration-normal hover:shadow-lg",
        colSpanClasses[colSpan],
        rowSpanClasses[rowSpan],
        className,
      )}
    >
      {children}
    </div>
  );
}
