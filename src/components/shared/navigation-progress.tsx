"use client";

import { useEffect, useSyncExternalStore } from "react";

import { usePathname } from "@/lib/i18n";

// --- Store externo para progresso de navegacao ---

let progress = 0;
let intervalId: ReturnType<typeof setInterval> | undefined;
let completionId: ReturnType<typeof setTimeout> | undefined;
let safetyId: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function emit() {
  for (const fn of listeners) fn();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  return progress;
}

function getServerSnapshot() {
  return 0;
}

function cleanup() {
  clearInterval(intervalId);
  clearTimeout(completionId);
  clearTimeout(safetyId);
}

/**
 * Inicia a barra de progresso de navegacao.
 * Chamado automaticamente ao clicar em links internos.
 * Pode ser chamado manualmente para navegacoes programaticas (router.push).
 */
export function startNavigation() {
  if (progress > 0 && progress < 100) return;

  cleanup();
  progress = 15;
  emit();

  intervalId = setInterval(() => {
    if (progress >= 90) {
      clearInterval(intervalId);
      return;
    }

    const step = progress < 50 ? Math.random() * 12 + 3 : Math.random() * 5 + 1;
    progress = Math.min(progress + step, 90);
    emit();
  }, 400);

  // Safety net: completa automaticamente apos 8s para evitar barra travada
  safetyId = setTimeout(completeNavigation, 8000);
}

/**
 * Completa a barra de progresso de navegacao.
 * Chamado automaticamente quando o pathname muda.
 */
export function completeNavigation() {
  if (progress === 0) return;

  cleanup();
  progress = 100;
  emit();

  completionId = setTimeout(() => {
    progress = 0;
    emit();
  }, 300);
}

// --- Componente ---

export function NavigationProgress() {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const pathname = usePathname();

  // Detecta cliques em links internos para iniciar o progresso
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest("a");

      if (!anchor) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (anchor.target === "_blank") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      if (
        href.startsWith("http") ||
        href.startsWith("//") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      // Ignora link para a mesma pagina
      const current = window.location.pathname;
      if (href === current || href === current + "/") return;

      startNavigation();
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () =>
      document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  // Completa o progresso quando o pathname muda (navegacao concluida)
  useEffect(() => {
    completeNavigation();
  }, [pathname]);

  if (value === 0) return null;

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="pointer-events-none fixed inset-x-0 top-0 z-9999 h-0.5"
    >
      <div
        className="h-full bg-primary transition-[width] duration-200 ease-out"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
