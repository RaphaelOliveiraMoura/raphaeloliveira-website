"use client";

import { useSyncExternalStore } from "react";

import { isClient } from "@/lib/utils/environment";

/**
 * Observa multiplas secoes do DOM e retorna o ID da secao atualmente visivel
 * na parte superior do viewport (scroll spy).
 *
 * Usa IntersectionObserver com rootMargin que privilegia a parte superior
 * da tela, garantindo que a secao "ativa" e aquela que o usuario esta lendo.
 *
 * @param sectionIds - Array de IDs dos elementos a observar
 * @param rootMargin - Margem do observer (padrao: destaca secao no topo 30% do viewport)
 */
export function useScrollSpy(
  sectionIds: readonly string[],
  rootMargin = "-10% 0px -70% 0px",
): string | null {
  const key = sectionIds.join(",");

  return useSyncExternalStore(
    (callback) => subscribeScrollSpy(sectionIds, rootMargin, callback),
    () => getActiveSection(key),
    () => null,
  );
}

// --- Store externo por grupo de IDs ---

const activeMap = new Map<string, string | null>();

function getActiveSection(key: string): string | null {
  return activeMap.get(key) ?? null;
}

function subscribeScrollSpy(
  sectionIds: readonly string[],
  rootMargin: string,
  callback: () => void,
): () => void {
  if (!isClient()) return () => {};

  const key = sectionIds.join(",");
  const visibleSet = new Set<string>();

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          visibleSet.add(entry.target.id);
        } else {
          visibleSet.delete(entry.target.id);
        }
      }

      // Retorna a primeira secao visivel na ordem original dos IDs
      const active =
        sectionIds.find((id) => visibleSet.has(id)) ?? activeMap.get(key);
      const prev = activeMap.get(key);

      if (active !== prev) {
        activeMap.set(key, active ?? null);
        callback();
      }
    },
    { rootMargin },
  );

  for (const id of sectionIds) {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  }

  return () => observer.disconnect();
}
