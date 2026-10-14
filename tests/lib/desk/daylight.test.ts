import { describe, expect, it } from "vitest";

import {
  getDaylight,
  getDaylightForHour,
  getDayPhase,
  getLocalHour,
} from "@/lib/desk";

describe("getLocalHour", () => {
  it("converte para o horário de Belo Horizonte (UTC-3)", () => {
    expect(getLocalHour(new Date("2026-10-14T12:30:00Z"))).toBeCloseTo(9.5);
    expect(getLocalHour(new Date("2026-10-14T02:00:00Z"))).toBeCloseTo(23);
  });
});

describe("getDayPhase", () => {
  it.each([
    [7, "morning"],
    [14, "afternoon"],
    [18, "evening"],
    [21, "night"],
    [3, "night"],
  ] as const)("às %sh é %s", (hour, phase) => {
    expect(getDayPhase(hour)).toBe(phase);
  });
});

describe("getDaylightForHour", () => {
  it("devolve direção de luz normalizada e acima da mesa", () => {
    for (let h = 0; h < 24; h += 0.5) {
      const [x, y, z] = getDaylightForHour(h).sunDirection;
      expect(Math.hypot(x, y, z)).toBeCloseTo(1, 5);
      expect(y).toBeGreaterThan(0);
    }
  });

  it("o sol entra pela frente de manhã e pelo fundo à tarde", () => {
    expect(getDaylightForHour(8).sunDirection[2]).toBeGreaterThan(0);
    expect(getDaylightForHour(17).sunDirection[2]).toBeLessThan(0);
  });

  it("acende a luminária só à noite", () => {
    expect(getDaylightForHour(12).lampOnByDefault).toBe(false);
    expect(getDaylightForHour(20).lampOnByDefault).toBe(true);
    expect(getDaylightForHour(4).lampOnByDefault).toBe(true);
  });

  it("a noite é mais escura que o meio-dia", () => {
    expect(getDaylightForHour(23).sunIntensity).toBeLessThan(
      getDaylightForHour(13).sunIntensity,
    );
  });

  it("interpola as cores de fundo como hex", () => {
    const { background } = getDaylightForHour(10);
    background.forEach((c) => expect(c).toMatch(/^#[0-9a-f]{6}$/));
  });
});

describe("getDaylight", () => {
  it("usa a data para escolher a fase", () => {
    expect(getDaylight(new Date("2026-10-14T23:00:00Z")).phase).toBe("night");
  });
});
