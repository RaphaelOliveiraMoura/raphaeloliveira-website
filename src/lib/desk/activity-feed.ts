import { createRandom, pick, randomInt } from "./random";

/**
 * Feed de atividade SIMULADO do notebook da mesa. Por enquanto não há
 * integração real (GitHub/Vercel): os eventos são gerados a partir de uma seed.
 */

export type ActivityKind = "commit" | "deploy" | "build" | "pr" | "test";

export interface ActivityEvent {
  id: number;
  kind: ActivityKind;
  repo: string;
  /** Mensagem de commit/PR (texto técnico, mantido em inglês). */
  message: string;
  ok: boolean;
  /** Duração em segundos (deploy, build e testes). */
  durationSec: number;
  /** Quantidade (testes que passaram, número do PR). */
  count: number;
  at: number;
}

export const ACTIVITY_REPOS = [
  "match-moment",
  "ito-online",
  "barca-api",
  "huntspace",
  "bugcap",
  "barcelona-app",
  "raphaeloliveira",
] as const;

const COMMIT_MESSAGES = [
  "feat: add lineup drag and drop",
  "fix: debounce match search",
  "refactor: split score service",
  "perf: cache standings query",
  "chore: bump next to 16.1",
  "test: cover timeline sorting",
  "feat: add room invite link",
  "fix: reconnect websocket on resume",
  "docs: update api examples",
  "feat: idle upgrades for interns",
  "style: tighten card spacing",
  "fix: handle empty fixtures",
  "feat: desk lamp follows local time",
  "fix: keep ball inside the table",
] as const;

const KINDS: readonly ActivityKind[] = [
  "commit",
  "commit",
  "commit",
  "deploy",
  "deploy",
  "build",
  "pr",
  "test",
];

export function createActivityEvent(
  rng: () => number,
  id: number,
  at: number,
): ActivityEvent {
  const kind = pick(rng, KINDS);
  const ok = kind === "commit" || kind === "pr" ? true : rng() > 0.05;
  return {
    id,
    kind,
    repo: pick(rng, ACTIVITY_REPOS),
    message: pick(rng, COMMIT_MESSAGES),
    ok,
    durationSec:
      kind === "test" ? randomInt(rng, 3, 40) : randomInt(rng, 18, 95),
    count: kind === "pr" ? randomInt(rng, 12, 240) : randomInt(rng, 24, 410),
    at,
  };
}

/** Histórico inicial, do mais recente para o mais antigo. */
export function createActivityHistory(
  seed: number,
  now: number,
  count = 8,
): ActivityEvent[] {
  const rng = createRandom(seed);
  const events: ActivityEvent[] = [];
  let at = now - randomInt(rng, 1, 4) * 60_000;
  for (let i = 0; i < count; i++) {
    events.push(createActivityEvent(rng, count - i, at));
    at -= randomInt(rng, 3, 40) * 60_000;
  }
  return events;
}

/** Intervalo até o próximo evento simulado, em ms. */
export function nextActivityDelay(rng: () => number): number {
  return randomInt(rng, 6, 14) * 1000;
}

export function getElapsedMinutes(at: number, now: number): number {
  return Math.max(0, Math.round((now - at) / 60_000));
}
