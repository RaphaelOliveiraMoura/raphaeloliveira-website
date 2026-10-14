import { describe, expect, it } from "vitest";

import {
  createBody,
  isResting,
  type PhysicsWorld,
  stepPhysics,
} from "@/lib/desk";

function world(partial: Partial<PhysicsWorld> = {}): PhysicsWorld {
  return {
    bodies: [],
    obstacles: [],
    bounds: { minX: -50, maxX: 50, minZ: -50, maxZ: 50 },
    goal: null,
    ...partial,
  };
}

describe("stepPhysics", () => {
  it("o atrito para o corpo com o tempo", () => {
    const ball = createBody({ id: "ball", x: 0, z: 0, radius: 2, vx: 30 });
    const w = world({ bodies: [ball] });
    for (let i = 0; i < 600; i++) stepPhysics(w, 1 / 60);
    expect(isResting(ball)).toBe(true);
    expect(ball.x).toBeGreaterThan(0);
  });

  it("quica na borda da mesa e avisa", () => {
    const ball = createBody({
      id: "ball",
      x: 45,
      z: 0,
      radius: 2,
      vx: 60,
      friction: 0,
    });
    const events = stepPhysics(world({ bodies: [ball] }), 0.2);
    expect(ball.vx).toBeLessThan(0);
    expect(ball.x).toBeLessThanOrEqual(48);
    expect(events.some((e) => e.type === "wall")).toBe(true);
  });

  it("bate num obstáculo retangular e informa qual", () => {
    const ball = createBody({
      id: "ball",
      x: -20,
      z: 0,
      radius: 2,
      vx: 80,
      friction: 0,
    });
    const events = stepPhysics(
      world({
        bodies: [ball],
        obstacles: [{ key: "book", kind: "box", x: 0, z: 0, hw: 10, hd: 10 }],
      }),
      0.3,
    );
    expect(ball.x).toBeLessThanOrEqual(-12 + 1e-6);
    expect(events).toContainEqual(
      expect.objectContaining({ type: "hit", key: "book" }),
    );
  });

  it("detecta gol quando a bola cruza a linha entre as traves", () => {
    const ball = createBody({
      id: "ball",
      x: -30,
      z: 0,
      radius: 2,
      vx: -80,
      friction: 0,
    });
    const events = stepPhysics(
      world({ bodies: [ball], goal: { x: -40, zMin: -6, zMax: 6 } }),
      0.3,
    );
    expect(events.filter((e) => e.type === "goal")).toHaveLength(1);
  });

  it("volta para casa quando pedido", () => {
    const ball = createBody({ id: "ball", x: 0, z: 0, radius: 2 });
    ball.x = 30;
    ball.returning = true;
    const w = world({ bodies: [ball] });
    for (let i = 0; i < 300; i++) stepPhysics(w, 1 / 60);
    expect(ball.x).toBe(0);
    expect(ball.returning).toBe(false);
  });

  it("lápis só rola na perpendicular do próprio eixo", () => {
    const pencil = createBody({
      id: "pencil",
      x: 0,
      z: 0,
      radius: 1,
      rollAxis: 0,
      vx: 20,
      vz: 20,
    });
    stepPhysics(world({ bodies: [pencil] }), 1 / 60);
    expect(pencil.vx).toBeCloseTo(0);
    expect(pencil.vz).toBeGreaterThan(0);
  });
});
