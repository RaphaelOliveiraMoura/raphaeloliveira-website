import { describe, expect, it } from "vitest";

import {
  clampOrbit,
  clampSeat,
  nextPreset,
  ORBIT_DISTANCE,
  ORBIT_LIMITS,
  ORBIT_PRESETS,
  ROOM_HALF_WIDTH,
  orbitPose,
  SEAT_EYE,
  SEAT_REST,
  seatPose,
  stepTour,
} from "@/lib/desk";

const dist = (a: number[], b: number[]) =>
  Math.hypot(...a.map((v, i) => v - (b[i] ?? 0)));

describe("orbitPose", () => {
  it("a vista inicial reproduz a câmera de sempre (0, 128, 138)", () => {
    const { position } = orbitPose(ORBIT_PRESETS.home);
    expect(position[0]).toBeCloseTo(-1, 0);
    expect(position[1]).toBeCloseTo(128, -1);
    expect(position[2]).toBeCloseTo(138, -1);
  });

  it("mantém a distância ao alvo e gira para a direita com yaw positivo", () => {
    const s = { ...ORBIT_PRESETS.home, yaw: 0.8, zoom: 0.5 };
    const pose = orbitPose(s);
    expect(dist(pose.position, pose.target)).toBeCloseTo(ORBIT_DISTANCE * 0.5);
    expect(pose.position[0]).toBeGreaterThan(pose.target[0]);
  });

  it("escala a distância e sobe a câmera no retrato", () => {
    const base = orbitPose(ORBIT_PRESETS.home);
    const portrait = orbitPose(ORBIT_PRESETS.home, 2, 0.4);
    expect(dist(portrait.position, portrait.target)).toBeCloseTo(
      dist(base.position, base.target) * 2,
    );
    expect(portrait.position[2] / portrait.position[1]).toBeLessThan(
      base.position[2] / base.position[1],
    );
  });
});

describe("orbitPose dentro do quarto", () => {
  it("nunca passa da parede lateral, mesmo afastada e girada ao máximo", () => {
    [-1, 1].forEach((yaw) => {
      const pose = orbitPose({
        yaw,
        elevation: ORBIT_LIMITS.elevation[0],
        zoom: ORBIT_LIMITS.zoom[1],
        target: [ORBIT_LIMITS.targetX[1] * -yaw, 0, 0],
      });
      expect(Math.abs(pose.position[0])).toBeLessThanOrEqual(
        ROOM_HALF_WIDTH + 1e-6,
      );
    });
  });
});

describe("clampOrbit", () => {
  it("não deixa a câmera atravessar paredes nem o tampo", () => {
    const s = clampOrbit({
      yaw: 3,
      elevation: -1,
      zoom: 9,
      target: [500, 0, -500],
    });
    expect(s.yaw).toBe(ORBIT_LIMITS.yaw[1]);
    expect(s.elevation).toBe(ORBIT_LIMITS.elevation[0]);
    expect(s.zoom).toBe(ORBIT_LIMITS.zoom[1]);
    expect(s.target).toEqual([
      ORBIT_LIMITS.targetX[1],
      0,
      ORBIT_LIMITS.targetZ[0],
    ]);
  });

  it("nenhuma vista pronta passa dos limites", () => {
    Object.values(ORBIT_PRESETS).forEach((p) =>
      expect(clampOrbit(p)).toEqual(p),
    );
  });
});

describe("seatPose", () => {
  it("em repouso, olha para a mesa a partir da cadeira", () => {
    const pose = seatPose(SEAT_REST);
    expect(pose.position).toEqual(SEAT_EYE);
    expect(pose.target[1]).toBeLessThan(SEAT_EYE[1]);
    expect(pose.target[2]).toBeLessThan(SEAT_EYE[2]);
  });

  it("inclinar aproxima os olhos da mesa", () => {
    const pose = seatPose({ ...SEAT_REST, lean: 1 });
    expect(pose.position[2]).toBeLessThan(SEAT_EYE[2]);
    expect(pose.position[1]).toBeLessThan(SEAT_EYE[1]);
  });

  it("clampSeat limita a cabeça e a inclinação", () => {
    expect(clampSeat({ yaw: 9, pitch: -9, lean: 3 })).toEqual({
      yaw: 1.2,
      pitch: -0.95,
      lean: 1,
    });
  });
});

describe("nextPreset e stepTour", () => {
  it("as vistas prontas giram em ciclo", () => {
    expect(nextPreset("home")).toBe("top");
    expect(nextPreset("window")).toBe("home");
  });

  it("o passeio vai da visão geral (-1) à última parada, sem dar a volta", () => {
    expect(stepTour(-1, 1, 3)).toBe(0);
    expect(stepTour(2, 1, 3)).toBe(2);
    expect(stepTour(0, -1, 3)).toBe(-1);
    expect(stepTour(-1, -1, 3)).toBe(-1);
  });
});
