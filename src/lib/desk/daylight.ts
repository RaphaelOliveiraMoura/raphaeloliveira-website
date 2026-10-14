export type DayPhase = "morning" | "afternoon" | "evening" | "night";

export interface Daylight {
  phase: DayPhase;
  hour: number;
  /** Vetor normalizado da mesa em direção à luz principal (sol ou lua). */
  sunDirection: [number, number, number];
  sunColor: number;
  sunIntensity: number;
  skyColor: number;
  groundColor: number;
  ambientIntensity: number;
  exposure: number;
  background: [string, string];
  lampOnByDefault: boolean;
}

/** Belo Horizonte segue o horário de Brasília. */
export const DESK_TIME_ZONE = "America/Sao_Paulo";

interface LightKeyframe {
  hour: number;
  sun: number;
  sunIntensity: number;
  sky: number;
  ground: number;
  ambient: number;
  exposure: number;
  bgInner: number;
  bgOuter: number;
}

const NIGHT: Omit<LightKeyframe, "hour"> = {
  sun: 0x9fb4d8,
  sunIntensity: 0.2,
  sky: 0x4a5572,
  ground: 0x2a241e,
  ambient: 0.5,
  exposure: 0.95,
  bgInner: 0x3a3631,
  bgOuter: 0x1a1815,
};

const KEYFRAMES: LightKeyframe[] = [
  { hour: 0, ...NIGHT },
  { hour: 5.4, ...NIGHT },
  {
    hour: 6.5,
    sun: 0xffc9a0,
    sunIntensity: 0.7,
    sky: 0xd8d4d0,
    ground: 0x7a6a58,
    ambient: 0.55,
    exposure: 1,
    bgInner: 0xefe3d6,
    bgOuter: 0xcdbfae,
  },
  {
    hour: 9,
    sun: 0xfff1dc,
    sunIntensity: 1,
    sky: 0xfff4e6,
    ground: 0x8c7b66,
    ambient: 0.75,
    exposure: 1.05,
    bgInner: 0xf3eee5,
    bgOuter: 0xd8d0c1,
  },
  {
    hour: 13,
    sun: 0xfff8ee,
    sunIntensity: 1.08,
    sky: 0xfdf8f0,
    ground: 0x8c7b66,
    ambient: 0.8,
    exposure: 1.05,
    bgInner: 0xf5f1ea,
    bgOuter: 0xdad3c6,
  },
  {
    hour: 16,
    sun: 0xffe7c8,
    sunIntensity: 1,
    sky: 0xfaf0e2,
    ground: 0x8c7b66,
    ambient: 0.72,
    exposure: 1.05,
    bgInner: 0xf3ece0,
    bgOuter: 0xd6cbb8,
  },
  {
    hour: 17.8,
    sun: 0xffb070,
    sunIntensity: 0.9,
    sky: 0xf0d8c0,
    ground: 0x7a5e48,
    ambient: 0.55,
    exposure: 1.02,
    bgInner: 0xf0dcc4,
    bgOuter: 0xc9ae92,
  },
  {
    hour: 18.8,
    sun: 0xd88a70,
    sunIntensity: 0.45,
    sky: 0x8a86a0,
    ground: 0x3a3028,
    ambient: 0.42,
    exposure: 0.98,
    bgInner: 0x9c8e8a,
    bgOuter: 0x4e4642,
  },
  { hour: 19.6, ...NIGHT },
  { hour: 24, ...NIGHT },
];

export function getLocalHour(date: Date, timeZone = DESK_TIME_ZONE): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return (hour % 24) + minute / 60;
}

export function getDayPhase(hour: number): DayPhase {
  if (hour >= 6 && hour < 11) return "morning";
  if (hour >= 11 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 19) return "evening";
  return "night";
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpColor(a: number, b: number, t: number): number {
  const r = Math.round(lerp((a >> 16) & 255, (b >> 16) & 255, t));
  const g = Math.round(lerp((a >> 8) & 255, (b >> 8) & 255, t));
  const bl = Math.round(lerp(a & 255, b & 255, t));
  return (r << 16) | (g << 8) | bl;
}

export function toHexColor(color: number): string {
  return `#${color.toString(16).padStart(6, "0")}`;
}

function getSunDirection(hour: number): [number, number, number] {
  const isDay = hour >= 5.8 && hour <= 19.2;
  if (!isDay) {
    const len = Math.hypot(-0.5, 0.78, -0.35);
    return [-0.5 / len, 0.78 / len, -0.35 / len];
  }
  // O sol entra pela janela da esquerda: nasce pela frente e se põe pelo fundo.
  const progress = Math.min(1, Math.max(0, (hour - 5.8) / 13.4));
  const elevation = (12 + Math.sin(progress * Math.PI) * 50) * (Math.PI / 180);
  const azimuth = lerp(0.75, -0.75, progress);
  return [
    -Math.cos(elevation) * Math.cos(azimuth),
    Math.sin(elevation),
    Math.cos(elevation) * Math.sin(azimuth),
  ];
}

export function getDaylightForHour(hour: number): Daylight {
  const h = ((hour % 24) + 24) % 24;
  const nextIndex = KEYFRAMES.findIndex((k) => k.hour > h);
  const fallback: LightKeyframe = { hour: 24, ...NIGHT };
  const b = KEYFRAMES[Math.max(1, nextIndex)] ?? fallback;
  const a = KEYFRAMES[Math.max(0, nextIndex - 1)] ?? fallback;
  const t = b.hour === a.hour ? 0 : (h - a.hour) / (b.hour - a.hour);

  return {
    phase: getDayPhase(h),
    hour: h,
    sunDirection: getSunDirection(h),
    sunColor: lerpColor(a.sun, b.sun, t),
    sunIntensity: lerp(a.sunIntensity, b.sunIntensity, t),
    skyColor: lerpColor(a.sky, b.sky, t),
    groundColor: lerpColor(a.ground, b.ground, t),
    ambientIntensity: lerp(a.ambient, b.ambient, t),
    exposure: lerp(a.exposure, b.exposure, t),
    background: [
      toHexColor(lerpColor(a.bgInner, b.bgInner, t)),
      toHexColor(lerpColor(a.bgOuter, b.bgOuter, t)),
    ],
    lampOnByDefault: h >= 18.5 || h < 6,
  };
}

export function getDaylight(date: Date, timeZone = DESK_TIME_ZONE): Daylight {
  return getDaylightForHour(getLocalHour(date, timeZone));
}
