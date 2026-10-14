/**
 * Física 2D mínima sobre o tampo da mesa (plano XZ): corpos circulares que
 * rolam, batem nos objetos e nas bordas, e voltam ao lugar quando pedido.
 */

export interface PhysicsBody {
  id: string;
  x: number;
  z: number;
  vx: number;
  vz: number;
  radius: number;
  mass: number;
  /** Taxa de desaceleração por segundo (atrito de rolamento). */
  friction: number;
  restitution: number;
  homeX: number;
  homeZ: number;
  returning: boolean;
  dragging: boolean;
  /** Ângulo (yaw) do eixo longo: o corpo só rola na perpendicular (lápis). */
  rollAxis: number | null;
  inGoal: boolean;
}

export type Obstacle =
  | { key: string; kind: "circle"; x: number; z: number; r: number }
  | { key: string; kind: "box"; x: number; z: number; hw: number; hd: number };

export interface GoalArea {
  /** Linha do gol (boca da trave). O gol fica do lado de x menor. */
  x: number;
  zMin: number;
  zMax: number;
}

export interface PhysicsWorld {
  bodies: PhysicsBody[];
  obstacles: Obstacle[];
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  goal: GoalArea | null;
}

export type PhysicsEvent =
  | {
      type: "hit";
      bodyId: string;
      key: string;
      speed: number;
      nx: number;
      nz: number;
    }
  | { type: "wall"; bodyId: string; speed: number }
  | { type: "bodies"; a: string; b: string; speed: number }
  | { type: "goal"; bodyId: string };

export const MAX_SPEED = 170;
const MIN_EVENT_SPEED = 4;
const RETURN_SPEED = 5;

export function createBody(
  init: Pick<PhysicsBody, "id" | "x" | "z" | "radius"> & Partial<PhysicsBody>,
): PhysicsBody {
  return {
    vx: 0,
    vz: 0,
    mass: 1,
    friction: 0.9,
    restitution: 0.62,
    homeX: init.x,
    homeZ: init.z,
    returning: false,
    dragging: false,
    rollAxis: null,
    inGoal: false,
    ...init,
  };
}

export function clampSpeed(vx: number, vz: number): [number, number] {
  const speed = Math.hypot(vx, vz);
  if (speed <= MAX_SPEED) return [vx, vz];
  const k = MAX_SPEED / speed;
  return [vx * k, vz * k];
}

export function isResting(body: PhysicsBody): boolean {
  return !body.returning && Math.hypot(body.vx, body.vz) < 0.05;
}

export function isHome(body: PhysicsBody): boolean {
  return Math.hypot(body.x - body.homeX, body.z - body.homeZ) < 0.05;
}

function closestPoint(o: Obstacle, x: number, z: number): [number, number] {
  if (o.kind === "circle") {
    const dx = x - o.x;
    const dz = z - o.z;
    const d = Math.hypot(dx, dz) || 1;
    return [o.x + (dx / d) * o.r, o.z + (dz / d) * o.r];
  }
  return [
    Math.min(o.x + o.hw, Math.max(o.x - o.hw, x)),
    Math.min(o.z + o.hd, Math.max(o.z - o.hd, z)),
  ];
}

function isInside(o: Obstacle, x: number, z: number): boolean {
  if (o.kind === "circle") return Math.hypot(x - o.x, z - o.z) < o.r;
  return Math.abs(x - o.x) < o.hw && Math.abs(z - o.z) < o.hd;
}

function collideObstacle(
  body: PhysicsBody,
  o: Obstacle,
  events: PhysicsEvent[],
): void {
  const [cx, cz] = closestPoint(o, body.x, body.z);
  let nx = body.x - cx;
  let nz = body.z - cz;
  let dist = Math.hypot(nx, nz);
  const inside = isInside(o, body.x, body.z);
  if (!inside && dist >= body.radius) return;

  if (dist < 1e-6 || inside) {
    // Centro dentro do obstáculo: empurra para fora pelo lado mais próximo.
    if (o.kind === "circle") {
      nx = body.x - o.x;
      nz = body.z - o.z;
      dist = Math.hypot(nx, nz) || 1;
      nx /= dist;
      nz /= dist;
      body.x = o.x + nx * (o.r + body.radius);
      body.z = o.z + nz * (o.r + body.radius);
    } else {
      const px = o.hw - Math.abs(body.x - o.x);
      const pz = o.hd - Math.abs(body.z - o.z);
      if (px < pz) {
        nx = Math.sign(body.x - o.x) || 1;
        nz = 0;
        body.x = o.x + nx * (o.hw + body.radius);
      } else {
        nx = 0;
        nz = Math.sign(body.z - o.z) || 1;
        body.z = o.z + nz * (o.hd + body.radius);
      }
    }
  } else {
    nx /= dist;
    nz /= dist;
    body.x = cx + nx * body.radius;
    body.z = cz + nz * body.radius;
  }

  const vn = body.vx * nx + body.vz * nz;
  if (vn < 0) {
    body.vx -= (1 + body.restitution) * vn * nx;
    body.vz -= (1 + body.restitution) * vn * nz;
    if (-vn > MIN_EVENT_SPEED) {
      events.push({
        type: "hit",
        bodyId: body.id,
        key: o.key,
        speed: -vn,
        nx,
        nz,
      });
    }
  }
}

function collideBounds(
  body: PhysicsBody,
  world: PhysicsWorld,
  events: PhysicsEvent[],
): void {
  const { minX, maxX, minZ, maxZ } = world.bounds;
  const r = body.radius;
  let speed = 0;
  if (body.x - r < minX) {
    body.x = minX + r;
    speed = Math.max(speed, -body.vx);
    body.vx = Math.abs(body.vx) * body.restitution;
  } else if (body.x + r > maxX) {
    body.x = maxX - r;
    speed = Math.max(speed, body.vx);
    body.vx = -Math.abs(body.vx) * body.restitution;
  }
  if (body.z - r < minZ) {
    body.z = minZ + r;
    speed = Math.max(speed, -body.vz);
    body.vz = Math.abs(body.vz) * body.restitution;
  } else if (body.z + r > maxZ) {
    body.z = maxZ - r;
    speed = Math.max(speed, body.vz);
    body.vz = -Math.abs(body.vz) * body.restitution;
  }
  if (speed > MIN_EVENT_SPEED)
    events.push({ type: "wall", bodyId: body.id, speed });
}

function collideBodies(
  a: PhysicsBody,
  b: PhysicsBody,
  events: PhysicsEvent[],
): void {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const dist = Math.hypot(dx, dz);
  const minDist = a.radius + b.radius;
  if (dist >= minDist || dist < 1e-6) return;
  const nx = dx / dist;
  const nz = dz / dist;
  const overlap = minDist - dist;
  const total = a.mass + b.mass;
  a.x -= nx * overlap * (b.mass / total);
  a.z -= nz * overlap * (b.mass / total);
  b.x += nx * overlap * (a.mass / total);
  b.z += nz * overlap * (a.mass / total);

  const rel = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz;
  if (rel >= 0) return;
  const e = Math.min(a.restitution, b.restitution);
  const j = (-(1 + e) * rel) / (1 / a.mass + 1 / b.mass);
  a.vx -= (j / a.mass) * nx;
  a.vz -= (j / a.mass) * nz;
  b.vx += (j / b.mass) * nx;
  b.vz += (j / b.mass) * nz;
  if (-rel > MIN_EVENT_SPEED)
    events.push({ type: "bodies", a: a.id, b: b.id, speed: -rel });
}

function constrainRoll(body: PhysicsBody): void {
  if (body.rollAxis === null) return;
  const nx = Math.sin(body.rollAxis);
  const nz = Math.cos(body.rollAxis);
  const vn = body.vx * nx + body.vz * nz;
  body.vx = vn * nx;
  body.vz = vn * nz;
}

function checkGoal(
  body: PhysicsBody,
  goal: GoalArea,
  events: PhysicsEvent[],
): void {
  const insideMouth = body.z > goal.zMin && body.z < goal.zMax;
  // Na mesa vale o centro da bola cruzar a linha (o gol é raso de propósito).
  if (!body.inGoal && insideMouth && body.x < goal.x) {
    body.inGoal = true;
    events.push({ type: "goal", bodyId: body.id });
  } else if (body.inGoal && body.x > goal.x + body.radius) {
    body.inGoal = false;
  }
}

/** Avança a simulação em `dt` segundos. Muta os corpos e devolve os eventos. */
export function stepPhysics(world: PhysicsWorld, dt: number): PhysicsEvent[] {
  const events: PhysicsEvent[] = [];
  const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
  const h = dt / steps;

  for (let s = 0; s < steps; s++) {
    for (const body of world.bodies) {
      if (body.dragging) continue;
      if (body.returning) {
        const dx = body.homeX - body.x;
        const dz = body.homeZ - body.z;
        const k = 1 - Math.exp(-h * RETURN_SPEED);
        body.vx = (dx * k) / h;
        body.vz = (dz * k) / h;
        body.x += dx * k;
        body.z += dz * k;
        body.inGoal = false;
        if (Math.hypot(dx, dz) < 0.05) {
          body.x = body.homeX;
          body.z = body.homeZ;
          body.vx = 0;
          body.vz = 0;
          body.returning = false;
        }
        continue;
      }
      constrainRoll(body);
      const decay = Math.exp(-h * body.friction);
      body.vx *= decay;
      body.vz *= decay;
      if (Math.hypot(body.vx, body.vz) < 0.3) {
        body.vx = 0;
        body.vz = 0;
      }
      body.x += body.vx * h;
      body.z += body.vz * h;
    }

    const active = world.bodies.filter((b) => !b.returning);
    active.forEach((a, i) => {
      active.slice(i + 1).forEach((b) => collideBodies(a, b, events));
    });
    for (const body of active) {
      for (const o of world.obstacles) collideObstacle(body, o, events);
      collideBounds(body, world, events);
      if (world.goal && body.id === "ball") checkGoal(body, world.goal, events);
    }
  }
  return events;
}
