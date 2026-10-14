/**
 * PRNG determinístico (mulberry32): mesma seed, mesma sequência.
 */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Item na posição `index`, dando a volta na lista (que não pode ser vazia). */
export function cycle<T>(list: readonly T[], index: number): T {
  const value = list[((index % list.length) + list.length) % list.length];
  if (value === undefined) throw new Error("cycle: lista vazia");
  return value;
}

export function pick<T>(rng: () => number, list: readonly T[]): T {
  return cycle(list, Math.floor(rng() * list.length));
}

export function randomInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/**
 * Interpolação simples de `{chave}` em strings já traduzidas.
 */
export function formatTemplate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
