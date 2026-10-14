import { describe, expect, it } from "vitest";

import {
  ACTIVITY_REPOS,
  createActivityHistory,
  createRandom,
  getElapsedMinutes,
  nextActivityDelay,
} from "@/lib/desk";

const NOW = Date.parse("2026-10-14T15:00:00Z");

describe("createActivityHistory", () => {
  it("é determinístico pela seed", () => {
    expect(createActivityHistory(42, NOW)).toEqual(
      createActivityHistory(42, NOW),
    );
    expect(createActivityHistory(42, NOW)).not.toEqual(
      createActivityHistory(7, NOW),
    );
  });

  it("ordena do mais recente para o mais antigo, sempre no passado", () => {
    const events = createActivityHistory(1, NOW, 10);
    expect(events).toHaveLength(10);
    events.forEach((e, i) => {
      expect(e.at).toBeLessThan(NOW);
      if (i > 0) expect(e.at).toBeLessThan(events[i - 1].at);
      expect(ACTIVITY_REPOS).toContain(e.repo);
    });
  });
});

describe("nextActivityDelay", () => {
  it("fica entre 6 e 14 segundos", () => {
    const rng = createRandom(3);
    for (let i = 0; i < 50; i++) {
      const d = nextActivityDelay(rng);
      expect(d).toBeGreaterThanOrEqual(6000);
      expect(d).toBeLessThanOrEqual(14000);
    }
  });
});

describe("getElapsedMinutes", () => {
  it("arredonda e nunca é negativo", () => {
    expect(getElapsedMinutes(NOW - 150_000, NOW)).toBe(3);
    expect(getElapsedMinutes(NOW + 10_000, NOW)).toBe(0);
  });
});
