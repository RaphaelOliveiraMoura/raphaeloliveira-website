/**
 * Câmera da mesa fora do foco: órbita livre, "sentado na cadeira" e o
 * passeio guiado. Só matemática; o motor 3D aplica o resultado.
 */

export type ViewMode = "orbit" | "seat" | "tour";
export type ViewPreset = "home" | "top" | "side" | "window";

export type Vec3Tuple = [number, number, number];

export interface OrbitState {
  /** Giro em volta da mesa (rad); positivo leva a câmera para a direita. */
  yaw: number;
  /** Altura do olhar (rad acima do tampo). */
  elevation: number;
  /** Multiplicador da distância (menor = mais perto). */
  zoom: number;
  target: Vec3Tuple;
}

export interface SeatState {
  yaw: number;
  pitch: number;
  /** Quanto o corpo se inclina para a frente, 0–1. */
  lean: number;
}

export interface CameraPose {
  position: Vec3Tuple;
  target: Vec3Tuple;
}

/** Distância base da órbita (a vista inicial da mesa). */
export const ORBIT_DISTANCE = 190;
/** Meia largura útil do quarto: a câmera nunca passa daqui em X. */
export const ROOM_HALF_WIDTH = 136;

/** Limites para a câmera não atravessar as paredes nem o tampo. */
export const ORBIT_LIMITS = {
  yaw: [-1, 1],
  elevation: [0.26, 1.36],
  zoom: [0.42, 1.15],
  targetX: [-70, 70],
  targetZ: [-45, 45],
} as const;

export const ORBIT_PRESETS: Record<ViewPreset, OrbitState> = {
  home: { yaw: 0, elevation: 0.737, zoom: 1, target: [-1, 0, -3] },
  top: { yaw: 0, elevation: 1.32, zoom: 1.02, target: [0, 0, -2] },
  side: { yaw: -0.92, elevation: 0.5, zoom: 0.92, target: [0, 6, 0] },
  window: { yaw: 0.98, elevation: 0.3, zoom: 0.95, target: [-10, 10, -4] },
};

export const PRESET_ORDER: readonly ViewPreset[] = [
  "home",
  "top",
  "side",
  "window",
];

/** Olhos de quem senta na cadeira, em frente à mesa. */
export const SEAT_EYE: Vec3Tuple = [0, 46, 96];
export const SEAT_LIMITS = {
  yaw: [-1.2, 1.2],
  pitch: [-0.95, 0.35],
} as const;
export const SEAT_REST: SeatState = { yaw: 0, pitch: -0.42, lean: 0 };
const SEAT_LEAN_DISTANCE = 42;

function clamp(value: number, [min, max]: readonly [number, number]): number {
  return Math.min(max, Math.max(min, value));
}

export function clampOrbit(s: OrbitState): OrbitState {
  return {
    yaw: clamp(s.yaw, ORBIT_LIMITS.yaw),
    elevation: clamp(s.elevation, ORBIT_LIMITS.elevation),
    zoom: clamp(s.zoom, ORBIT_LIMITS.zoom),
    target: [
      clamp(s.target[0], ORBIT_LIMITS.targetX),
      s.target[1],
      clamp(s.target[2], ORBIT_LIMITS.targetZ),
    ],
  };
}

export function clampSeat(s: SeatState): SeatState {
  return {
    yaw: clamp(s.yaw, SEAT_LIMITS.yaw),
    pitch: clamp(s.pitch, SEAT_LIMITS.pitch),
    lean: clamp(s.lean, [0, 1]),
  };
}

/**
 * Pose da órbita. `distanceScale` compensa telas estreitas (a mesa precisa
 * caber) e `elevationBoost` deixa o retrato mais de cima.
 */
export function orbitPose(
  s: OrbitState,
  distanceScale = 1,
  elevationBoost = 0,
): CameraPose {
  const elevation = Math.min(1.45, s.elevation + elevationBoost);
  const [tx, ty, tz] = s.target;
  let distance = ORBIT_DISTANCE * s.zoom * distanceScale;
  // Aproxima a câmera quando o giro a levaria para dentro de uma parede lateral.
  const side = Math.abs(Math.sin(s.yaw) * Math.cos(elevation));
  if (side > 1e-6) {
    const room = ROOM_HALF_WIDTH - Math.sign(s.yaw) * tx;
    distance = Math.min(distance, room / side);
  }
  const horizontal = Math.cos(elevation) * distance;
  return {
    position: [
      tx + Math.sin(s.yaw) * horizontal,
      ty + Math.sin(elevation) * distance,
      tz + Math.cos(s.yaw) * horizontal,
    ],
    target: [tx, ty, tz],
  };
}

export function seatPose(s: SeatState): CameraPose {
  const dir: Vec3Tuple = [
    -Math.sin(s.yaw) * Math.cos(s.pitch),
    Math.sin(s.pitch),
    -Math.cos(s.yaw) * Math.cos(s.pitch),
  ];
  const lean = s.lean * SEAT_LEAN_DISTANCE;
  const position: Vec3Tuple = [
    SEAT_EYE[0] + dir[0] * lean,
    SEAT_EYE[1] + dir[1] * lean * 0.6,
    SEAT_EYE[2] + dir[2] * lean,
  ];
  return {
    position,
    target: [
      position[0] + dir[0] * 60,
      position[1] + dir[1] * 60,
      position[2] + dir[2] * 60,
    ],
  };
}

export function nextPreset(current: ViewPreset): ViewPreset {
  const i = PRESET_ORDER.indexOf(current);
  return PRESET_ORDER[(i + 1) % PRESET_ORDER.length] ?? "home";
}

/**
 * Parada do passeio: -1 é a visão geral; depois uma parada por objeto.
 * Não dá a volta: no fim, para no último.
 */
export function stepTour(index: number, delta: 1 | -1, total: number): number {
  return Math.max(-1, Math.min(total - 1, index + delta));
}
