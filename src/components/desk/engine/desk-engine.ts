import * as THREE from "three";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";

import {
  DESK_SECTIONS,
  type DeskContent,
  type DeskSectionKey,
} from "@/components/desk/desk-content";

import {
  clampSpeed,
  type Daylight,
  getDaylight,
  getDaylightForHour,
  isHome,
  nearestPreset,
  nextPreset,
  ORBIT_PRESETS,
  orbitPose,
  SEAT_EYE,
  STATION_LINKS,
  stepPhysics,
  stepTour,
  type ViewMode,
  type ViewPreset,
  type ViewStation,
} from "@/lib/desk";
import { isClient } from "@/lib/utils/environment";

import { CameraRig } from "./camera-rig";
import { buildEnvironment, TABLE } from "./environment";
import { buildBook } from "./objects/book";
import { buildCardStack } from "./objects/card-stack";
import { buildCorkboard } from "./objects/corkboard";
import { buildDrawer } from "./objects/drawer";
import { buildFootball } from "./objects/football";
import { buildLetterRack } from "./objects/letter-rack";
import { buildMug } from "./objects/mug";
import { buildNotebook } from "./objects/notebook";
import { buildPencilCup } from "./objects/pencil-cup";
import type { DeskFonts } from "./paint";
import { buildRoom, type Room } from "./room";
import {
  createSceneKit,
  type DeskEngineStrings,
  type FrameState,
  type Part,
  type Vec3,
} from "./scene-kit";

export type DeskSound =
  | "open"
  | "paper"
  | "drawer"
  | "ceramic"
  | "wood"
  | "kick"
  | "thud"
  | "flip"
  | "click"
  | "goal"
  | "key";

export interface DeskViewState {
  mode: ViewMode;
  preset: ViewPreset | null;
  /** Parada do passeio: -1 é a visão geral. */
  tourIndex: number;
  tourTotal: number;
}

export interface DeskEngineCallbacks {
  onFocusChange: (focus: DeskSectionKey | null, item: number) => void;
  onIntroEnd: () => void;
  onGoal: () => void;
  onSound: (sound: DeskSound, volume?: number) => void;
  onDaylight: (daylight: Daylight) => void;
  onLampChange: (on: boolean) => void;
  onViewChange: (view: DeskViewState) => void;
}

export interface DeskEngineOptions {
  canvas: HTMLCanvasElement;
  content: DeskContent;
  fonts: DeskFonts;
  strings: DeskEngineStrings;
  reducedMotion: boolean;
  playIntro: boolean;
  /** Força a hora de BH (0–24), para ver a mesa em outro momento do dia. */
  hourOverride: number | null;
  /** Modo inicial da câmera: órbita no desktop, passeio no celular. */
  initialMode: ViewMode;
  callbacks: DeskEngineCallbacks;
}

interface FocusConfig {
  dist: number;
  lift: number;
  sx: number;
  tz?: number;
  off: Vec3 | null;
  camera?: Vec3;
  anchor?: Vec3;
}

const FOCUS: Record<DeskSectionKey, FocusConfig> = {
  about: { dist: 1.35, lift: 2, sx: -2, off: null, anchor: [0, 6, -22] },
  projects: { dist: 1.75, lift: 9, sx: -15, off: [-32, 12, 10] },
  career: { dist: 1.55, lift: 7, sx: -14, off: [-30, 12, 10] },
  inspirations: { dist: 1.55, lift: 15, sx: -13, off: [-28, 15, 12] },
  tools: { dist: 1.3, lift: 9, sx: -11, off: [-22, 13, 8] },
  now: { dist: 1.3, lift: 6, sx: -11, off: [-22, 9, 8] },
  football: { dist: 1.35, lift: 5, sx: 11, off: [24, 9, 8] },
  contact: { dist: 1.55, lift: 8, sx: 14, off: [30, 12, 10] },
  notebook: {
    dist: 1,
    lift: 10.2,
    sx: 0,
    tz: -12.1,
    off: null,
    camera: [0, 19, 64],
    anchor: [0, 20.5, -14.5],
  },
};

const FOCUS_SOUND: Record<DeskSectionKey, DeskSound> = {
  about: "open",
  projects: "drawer",
  career: "paper",
  inspirations: "paper",
  tools: "wood",
  now: "ceramic",
  football: "kick",
  contact: "paper",
  notebook: "key",
};

const INTRO_ORDER: DeskSectionKey[] = [
  "about",
  "notebook",
  "projects",
  "career",
  "tools",
  "now",
  "inspirations",
  "contact",
  "football",
];
const INTRO = {
  camera: 2.8,
  start: 0.45,
  stagger: 0.13,
  drop: 0.8,
  height: 55,
};
const HOME = {
  position: new THREE.Vector3(0, 128, 138),
  target: new THREE.Vector3(-1, 0, -3),
};
const INTRO_START = new THREE.Vector3(0, 300, 40);
/** Ordem das paradas do passeio guiado. */
const TOUR: readonly DeskSectionKey[] = DESK_SECTIONS;
/** Rodinha: soma de deltaY que vale uma parada do passeio, e a pausa entre paradas. */
const WHEEL_STEP = 40;
const WHEEL_COOLDOWN = 650;
const SWIPE_MIN = 40;
/** Distância (px) do mouse até o marcador para o rótulo aparecer. */
const TAG_NEAR_PX = 120;
/** Margem das setas de caminho quando o destino sai da tela. */
const ARROW_MARGIN = { x: 70, top: 110, bottom: 150 };
const DRAG_THRESHOLD = 6;
const APERTURE = 0.0016;
const PLANE_Y = { ball: 4.5, pencil: 0.48 } as const;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutBounce(t: number): number {
  const n = 7.5625;
  const d = 2.75;
  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
  return n * (t -= 2.625 / d) * t + 0.984375;
}

/** Seção e índice de uma peça (o grupo herda a marcação da primeira malha). */
function partTag(pt: Part): { key: string | undefined; item: number } {
  const data = pt.object.userData.itemKey
    ? pt.object.userData
    : (pt.object.children[0]?.userData ?? {});
  return {
    key: data.itemKey as string | undefined,
    item: (data.item as number | undefined) ?? 0,
  };
}

interface DeviceOrientationPermission {
  requestPermission?: () => Promise<PermissionState>;
}

export function isWebGLAvailable(): boolean {
  if (!isClient()) return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Motor da mesa 3D. É imperativo de propósito: o loop roda fora do React e só
 * avisa a UI (via callbacks) quando o foco, o item ou a luz mudam.
 */
export class DeskEngine {
  private readonly opts: DeskEngineOptions;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly composer: EffectComposer;
  private readonly bokeh: BokehPass;
  private readonly camera = new THREE.PerspectiveCamera(32, 1, 1, 1000);
  private readonly goalCamera = new THREE.PerspectiveCamera(32, 1, 1, 1000);
  private readonly kit;
  private readonly env;
  private readonly play;
  private readonly notebook;
  private readonly room: Room;
  private readonly rig: CameraRig;
  private readonly pointers = new Map<number, { x: number; y: number }>();
  private pinch = 0;
  private wheelSum = 0;
  private wheelLock = 0;
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly camPos = new THREE.Vector3();
  private readonly camTarget = new THREE.Vector3();
  private readonly tags = new Map<DeskSectionKey, HTMLElement>();
  private float: HTMLElement | null = null;
  private readonly waypoints = new Map<ViewStation, HTMLElement>();
  private pointerPx: { x: number; y: number } | null = null;
  private readonly coarse: boolean;
  private readonly cleanups: (() => void)[] = [];
  private raf = 0;
  private last = 0;
  private elapsed = 0;

  private focusKey: DeskSectionKey | null = null;
  private item = 0;
  private hover: DeskSectionKey | null = null;
  private hoverItem = -1;
  private sway = { x: 0, y: 0 };
  private gyro: { x: number; y: number } | null = null;
  private blur = 0;
  private introT: number | null;
  private landed = new Set<DeskSectionKey>();
  private lampOn = false;
  private daylightTimer = 0;
  private goalReturn = 0;
  private netShake = 0;

  private drag: {
    id: number;
    x: number;
    y: number;
    body: string | null;
    active: boolean;
    lastPX: number;
    lastPY: number;
    lastMoveT: number;
    lastX: number;
    lastZ: number;
    lastT: number;
    vx: number;
    vz: number;
  } | null = null;

  constructor(opts: DeskEngineOptions) {
    this.opts = opts;
    const { canvas } = opts;
    this.coarse = window.matchMedia("(pointer: coarse)").matches;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, this.coarse ? 1.5 : 2),
    );
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    this.kit = createSceneKit(
      this.renderer,
      scene,
      opts.fonts,
      opts.content,
      opts.strings,
    );
    this.env = buildEnvironment(this.kit);
    this.room = buildRoom(this.kit);
    this.rig = new CameraRig(opts.initialMode, opts.reducedMotion);
    buildBook(this.kit);
    buildDrawer(this.kit);
    buildCardStack(this.kit);
    buildCorkboard(this.kit);
    buildPencilCup(this.kit);
    buildMug(this.kit);
    buildLetterRack(this.kit);
    this.notebook = buildNotebook(this.kit);
    this.play = buildFootball(this.kit);

    const target = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.HalfFloatType,
      samples: this.coarse ? 2 : 4,
    });
    this.composer = new EffectComposer(this.renderer, target);
    this.composer.addPass(new RenderPass(scene, this.camera));
    this.bokeh = new BokehPass(scene, this.camera, {
      focus: 100,
      aperture: 0,
      maxblur: 0.02,
    });
    this.bokeh.enabled = false;
    // Faixa nítida em volta do foco: a peça em destaque e o objeto ficam
    // legíveis e só o resto da mesa desfoca.
    const bokehMat = this.bokeh.materialBokeh;
    bokehMat.uniforms.focusRange = { value: 10 };
    bokehMat.fragmentShader = bokehMat.fragmentShader
      .replace(
        "uniform float focus;",
        "uniform float focus;\nuniform float focusRange;",
      )
      .replace(
        "float factor = ( focus + viewZ );",
        "float d = focus + viewZ;\nfloat factor = sign( d ) * max( 0.0, abs( d ) - focusRange );",
      );
    bokehMat.needsUpdate = true;
    // O passe de profundidade troca todos os materiais: esconde o caixilho
    // (que só existe para projetar sombra) e não recalcula as sombras.
    const bokehRender = this.bokeh.render.bind(this.bokeh);
    const shadowMap = this.renderer.shadowMap;
    const windowFrame = this.env.windowFrame;
    this.bokeh.render = (...args) => {
      windowFrame.visible = false;
      shadowMap.autoUpdate = false;
      bokehRender(...args);
      shadowMap.autoUpdate = true;
      windowFrame.visible = true;
    };
    this.composer.addPass(this.bokeh);
    this.composer.addPass(new OutputPass());

    this.introT = opts.playIntro && !opts.reducedMotion ? 0 : null;
    this.camPos.copy(this.introT === null ? HOME.position : INTRO_START);
    this.camTarget.copy(HOME.target);

    this.applyDaylight(true);
    this.resize();
    const ro = new ResizeObserver(() => this.resize());
    ro.observe(canvas);
    this.cleanups.push(() => ro.disconnect());
    this.bindInput();

    if (document.fonts?.ready) {
      void document.fonts.ready.then(() =>
        this.kit.redraws.forEach((fn) => fn()),
      );
    }

    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
    queueMicrotask(() => {
      this.emitView();
      if (this.introT === null) opts.callbacks.onIntroEnd();
    });
  }

  // ---------- API pública ----------

  setFocus(key: DeskSectionKey | null, item = 0): void {
    if (this.introT !== null) this.finishIntro();
    const changed = key !== this.focusKey;
    this.focusKey = key;
    this.item = key ? Math.max(0, Math.min(item, this.itemCount(key) - 1)) : 0;
    if (this.rig.mode === "tour") {
      this.rig.tourIndex = key ? TOUR.indexOf(key) : -1;
      this.emitView();
    }
    if (changed) {
      this.play.bodies.forEach((b) => {
        if (!isHome(b)) b.returning = true;
      });
      this.opts.callbacks.onSound(key ? FOCUS_SOUND[key] : "click", 0.7);
    }
    this.opts.callbacks.onFocusChange(this.focusKey, this.item);
  }

  setItem(item: number): void {
    const key = this.focusKey;
    if (!key) return;
    const n = this.itemCount(key);
    const next = ((item % n) + n) % n;
    if (next === this.item) return;
    this.item = next;
    this.opts.callbacks.onSound(
      key === "about" ? "flip" : key === "notebook" ? "key" : "paper",
      0.6,
    );
    this.opts.callbacks.onFocusChange(key, this.item);
  }

  stepItem(delta: 1 | -1): void {
    this.setItem(this.item + delta);
  }

  setLamp(on: boolean): void {
    this.lampOn = on;
    this.env.setLamp(on);
    this.opts.callbacks.onSound("click", 0.8);
    this.opts.callbacks.onLampChange(on);
  }

  toggleLamp(): void {
    this.setLamp(!this.lampOn);
  }

  setViewMode(mode: ViewMode): void {
    if (this.introT !== null) this.finishIntro();
    this.rig.setMode(mode);
    if (this.focusKey) this.setFocus(null);
    this.opts.callbacks.onSound("click", 0.5);
    this.emitView();
  }

  setPreset(preset: ViewPreset): void {
    if (this.focusKey) this.setFocus(null);
    this.rig.setPreset(preset);
    this.emitView();
  }

  cyclePreset(): void {
    this.setPreset(nextPreset(this.rig.preset ?? "home"));
  }

  /** Avança (1) ou volta (-1) uma parada do passeio guiado. */
  tourStep(delta: 1 | -1): void {
    if (this.rig.mode !== "tour") this.rig.setMode("tour");
    const index = stepTour(this.rig.tourIndex, delta, TOUR.length);
    this.rig.tourIndex = index;
    this.setFocus(index < 0 ? null : (TOUR[index] ?? null));
    this.emitView();
  }

  skipIntro(): void {
    if (this.introT !== null) this.finishIntro();
  }

  setTagElement(key: DeskSectionKey, el: HTMLElement | null): void {
    if (el) this.tags.set(key, el);
    else this.tags.delete(key);
  }

  setWaypointElement(station: ViewStation, el: HTMLElement | null): void {
    if (el) this.waypoints.set(station, el);
    else this.waypoints.delete(station);
  }

  /** Anda até um ponto de vista vizinho (as setas no cenário). */
  goToStation(station: ViewStation): void {
    if (station === "seat") this.setViewMode("seat");
    else this.setPreset(station);
  }

  setFloatElement(el: HTMLElement | null): void {
    this.float = el;
  }

  terminalDraft(text: string): void {
    this.notebook.setDraft(text);
  }

  terminalSubmit(text: string): void {
    this.notebook.submit(text);
    this.opts.callbacks.onSound("key", 0.5);
  }

  dispose(): void {
    cancelAnimationFrame(this.raf);
    this.cleanups.forEach((fn) => fn());
    this.kit.scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.geometry.dispose();
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      materials.forEach((m) => {
        const std = m as THREE.MeshStandardMaterial;
        std.map?.dispose();
        std.emissiveMap?.dispose();
        m.dispose();
      });
    });
    this.composer.dispose();
    this.renderer.dispose();
  }

  // ---------- internos ----------

  private itemCount(key: DeskSectionKey): number {
    return Math.max(1, this.opts.content[key].length);
  }

  private get aspect(): number {
    return this.camera.aspect;
  }

  private get portrait(): boolean {
    return this.aspect < 0.9;
  }

  private emitView(): void {
    this.opts.callbacks.onViewChange({
      mode: this.rig.mode,
      preset: this.rig.preset,
      tourIndex: this.rig.tourIndex,
      tourTotal: TOUR.length,
    });
  }

  private finishIntro(): void {
    this.introT = null;
    this.opts.callbacks.onIntroEnd();
  }

  private applyDaylight(initial: boolean): void {
    const override = this.opts.hourOverride;
    const daylight =
      override === null
        ? getDaylight(new Date())
        : getDaylightForHour(override);
    this.env.applyDaylight(daylight);
    this.room.applyDaylight(daylight);
    this.opts.callbacks.onDaylight(daylight);
    if (initial) {
      this.lampOn = daylight.lampOnByDefault;
      this.env.setLamp(this.lampOn);
      this.opts.callbacks.onLampChange(this.lampOn);
    }
  }

  private resize(): void {
    const canvas = this.opts.canvas;
    const w = canvas.clientWidth || 1440;
    const h = canvas.clientHeight || 900;
    this.renderer.setSize(w, h, false);
    this.composer.setPixelRatio(this.renderer.getPixelRatio());
    this.composer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.goalCamera.aspect = w / h;
    this.goalCamera.updateProjectionMatrix();
  }

  private focusView(key: DeskSectionKey): {
    p: THREE.Vector3;
    t: THREE.Vector3;
  } {
    const c = FOCUS[key];
    const base = this.kit.objects[key]?.base ?? new THREE.Vector3();
    const mobile = this.portrait;
    const t = base
      .clone()
      .add(
        new THREE.Vector3(
          mobile ? 0 : c.sx,
          c.lift + (mobile && c.off ? 9 : 0),
          c.tz ?? 0,
        ),
      );
    const cam = c.camera
      ? new THREE.Vector3(...c.camera)
      : new THREE.Vector3(0, 40 * c.dist, 50 * c.dist);
    if (mobile) cam.multiplyScalar(c.off ? 1.55 : 1.35);
    return { p: t.clone().add(cam), t };
  }

  private presentOffset(key: DeskSectionKey): Vec3 {
    const off = FOCUS[key].off ?? [0, 0, 0];
    return this.portrait ? [0, off[1] + 14, off[2] + 6] : off;
  }

  private setPointer(ev: PointerEvent | MouseEvent): void {
    const r = this.opts.canvas.getBoundingClientRect();
    this.pointer.set(
      ((ev.clientX - r.left) / r.width) * 2 - 1,
      -((ev.clientY - r.top) / r.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.pointer, this.camera);
  }

  private isPresentedNow(o: THREE.Object3D): boolean {
    const d = o.userData;
    return Boolean(
      this.focusKey &&
      d.presented &&
      d.itemKey === this.focusKey &&
      d.item === this.item,
    );
  }

  private pick(): {
    first: THREE.Intersection | null;
    hit: THREE.Object3D | null;
  } {
    const list = this.raycaster.intersectObjects(this.kit.hits, false);
    const first = list[0] ?? null;
    const hit =
      list.find((h) => !this.isPresentedNow(h.object))?.object ?? null;
    return { first, hit };
  }

  private bindInput(): void {
    const canvas = this.opts.canvas;
    const on = <K extends keyof HTMLElementEventMap>(
      target: HTMLElement | Window,
      type: K,
      fn: (ev: HTMLElementEventMap[K]) => void,
    ) => {
      target.addEventListener(type, fn as EventListener);
      this.cleanups.push(() =>
        target.removeEventListener(type, fn as EventListener),
      );
    };

    let askedGyro = false;
    const enableGyro = () => {
      if (askedGyro || this.opts.reducedMotion || !this.coarse) return;
      askedGyro = true;
      const listen = () => {
        const handler = (e: DeviceOrientationEvent) => {
          if (e.gamma === null || e.beta === null) return;
          this.gyro = {
            x: Math.max(-1, Math.min(1, e.gamma / 25)),
            y: Math.max(-1, Math.min(1, (45 - e.beta) / 25)),
          };
        };
        window.addEventListener("deviceorientation", handler);
        this.cleanups.push(() =>
          window.removeEventListener("deviceorientation", handler),
        );
      };
      const ctor = (
        window as unknown as {
          DeviceOrientationEvent?: DeviceOrientationPermission;
        }
      ).DeviceOrientationEvent;
      if (ctor?.requestPermission) {
        ctor
          .requestPermission()
          .then((state) => {
            if (state === "granted") listen();
          })
          .catch(() => undefined);
      } else {
        listen();
      }
    };

    const wheel = (ev: WheelEvent) => {
      ev.preventDefault();
      if (this.introT !== null) return;
      if (this.rig.mode === "tour") {
        const now = performance.now();
        if (now < this.wheelLock) return;
        this.wheelSum += ev.deltaY;
        if (Math.abs(this.wheelSum) < WHEEL_STEP) return;
        this.tourStep(this.wheelSum > 0 ? 1 : -1);
        this.wheelSum = 0;
        this.wheelLock = now + WHEEL_COOLDOWN;
        return;
      }
      if (this.focusKey) return;
      this.rig.zoomBy(Math.exp(ev.deltaY * 0.0012));
    };
    canvas.addEventListener("wheel", wheel, { passive: false });
    this.cleanups.push(() => canvas.removeEventListener("wheel", wheel));

    on(canvas, "dblclick", (ev) => {
      if (this.focusKey || this.rig.mode !== "orbit") return;
      this.setPointer(ev);
      const { hit } = this.pick();
      if (hit && hit.userData.key !== "table") return;
      const point = new THREE.Vector3();
      const table = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      if (this.raycaster.ray.intersectPlane(table, point)) {
        this.rig.flyTo(point);
        this.emitView();
      }
    });

    on(canvas, "pointerdown", (ev) => {
      enableGyro();
      this.pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      if (this.introT !== null) {
        this.finishIntro();
        return;
      }
      this.setPointer(ev);
      const { hit } = this.pick();
      const body = hit?.userData.body as string | undefined;
      const canDrag = body && (!this.focusKey || this.focusKey === "football");
      this.drag = {
        id: ev.pointerId,
        x: ev.clientX,
        y: ev.clientY,
        body: canDrag ? body : null,
        active: false,
        lastPX: ev.clientX,
        lastPY: ev.clientY,
        lastMoveT: performance.now(),
        lastX: 0,
        lastZ: 0,
        lastT: performance.now(),
        vx: 0,
        vz: 0,
      };
    });

    on(canvas, "pointermove", (ev) => {
      if (ev.pointerType === "mouse") {
        const r = canvas.getBoundingClientRect();
        this.pointerPx = { x: ev.clientX - r.left, y: ev.clientY - r.top };
      }
      if (this.pointers.has(ev.pointerId)) {
        this.pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      }
      if (this.pointers.size === 2) {
        // Pinça: aproxima/afasta (ou inclina na cadeira); cancela o arraste.
        const [a, b] = [...this.pointers.values()];
        const dist = a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
        if (this.pinch > 0 && dist > 0 && !this.focusKey) {
          this.rig.zoomBy(this.pinch / dist);
        }
        this.pinch = dist;
        if (this.drag?.active) this.rig.endDrag(true);
        this.drag = null;
        return;
      }
      this.setPointer(ev);
      if (ev.pointerType === "mouse")
        this.sway = { x: this.pointer.x, y: this.pointer.y };
      const drag = this.drag;
      if (drag && drag.id === ev.pointerId) {
        const moved = Math.hypot(ev.clientX - drag.x, ev.clientY - drag.y);
        if (!drag.active && moved > DRAG_THRESHOLD) {
          drag.active = true;
          try {
            canvas.setPointerCapture(ev.pointerId);
          } catch {
            // Ponteiro sintético ou já liberado: segue sem captura.
          }
          const body = this.play.bodies.find((b) => b.id === drag.body);
          if (body) {
            body.dragging = true;
            body.returning = false;
            drag.lastX = body.x;
            drag.lastZ = body.z;
          } else if (this.canLook()) {
            this.rig.beginDrag();
          }
        }
        if (drag.active) {
          this.updateDrag(ev);
          return;
        }
      }
      this.updateHover();
    });

    const release = (ev: PointerEvent) => {
      this.pointers.delete(ev.pointerId);
      if (this.pointers.size < 2) this.pinch = 0;
      const drag = this.drag;
      if (!drag || drag.id !== ev.pointerId) return;
      this.drag = null;
      if (canvas.hasPointerCapture(ev.pointerId))
        canvas.releasePointerCapture(ev.pointerId);
      if (drag.active) {
        const body = this.play.bodies.find((b) => b.id === drag.body);
        if (body) {
          body.dragging = false;
          // Soltar parado não arremessa: só conta o movimento dos últimos instantes.
          const still = performance.now() - drag.lastT > 90;
          [body.vx, body.vz] = still ? [0, 0] : clampSpeed(drag.vx, drag.vz);
          if (Math.hypot(body.vx, body.vz) > 20)
            this.opts.callbacks.onSound("kick", 0.8);
          return;
        }
        if (this.canLook()) {
          this.rig.endDrag(performance.now() - drag.lastMoveT > 90);
          return;
        }
        // No passeio, deslizar para cima/baixo troca de parada.
        const dx = ev.clientX - drag.x;
        const dy = ev.clientY - drag.y;
        if (
          this.rig.mode === "tour" &&
          Math.abs(dy) > SWIPE_MIN &&
          Math.abs(dy) > Math.abs(dx)
        ) {
          this.tourStep(dy < 0 ? 1 : -1);
        }
        return;
      }
      if (ev.type === "pointerup") this.handleClick(ev);
    };
    on(canvas, "pointerup", release);
    on(canvas, "pointercancel", release);
    on(canvas, "pointerleave", () => {
      this.sway = { x: 0, y: 0 };
      this.pointerPx = null;
      this.hover = null;
    });
  }

  private updateDrag(ev: PointerEvent): void {
    const drag = this.drag;
    if (!drag) return;
    const body = this.play.bodies.find((b) => b.id === drag.body);
    if (!body) {
      // Arrastar no vazio gira a câmera em volta da mesa (ou vira a cabeça na cadeira).
      if (!this.canLook()) return;
      const r = this.opts.canvas.getBoundingClientRect();
      const now = performance.now();
      this.rig.dragBy(
        (ev.clientX - drag.lastPX) / r.width,
        (ev.clientY - drag.lastPY) / r.height,
        (now - drag.lastMoveT) / 1000,
      );
      drag.lastPX = ev.clientX;
      drag.lastPY = ev.clientY;
      drag.lastMoveT = now;
      return;
    }
    const y = PLANE_Y[body.id as keyof typeof PLANE_Y] ?? 0;
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -y);
    const point = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(plane, point)) return;
    const hw = TABLE.width / 2 - body.radius;
    const hd = TABLE.depth / 2 - body.radius;
    body.x = Math.max(-hw, Math.min(hw, point.x));
    body.z = Math.max(-hd, Math.min(hd, point.z));
    const now = performance.now();
    const dt = Math.max(0.001, (now - drag.lastT) / 1000);
    const k = 0.45;
    drag.vx = drag.vx * (1 - k) + ((body.x - drag.lastX) / dt) * k;
    drag.vz = drag.vz * (1 - k) + ((body.z - drag.lastZ) / dt) * k;
    drag.lastX = body.x;
    drag.lastZ = body.z;
    drag.lastT = now;
  }

  /** Arrastar no vazio mexe a câmera só fora do foco e fora do passeio. */
  private canLook(): boolean {
    return !this.focusKey && this.rig.mode !== "tour";
  }

  private updateHover(): void {
    const { hit } = this.pick();
    const d = hit?.userData ?? {};
    const key =
      (d.key as DeskSectionKey | "table" | "lamp" | undefined) ?? null;
    const focus = this.focusKey;
    const interactive =
      key === "lamp" ||
      (key &&
        key !== "table" &&
        (focus ? d.itemKey === focus || Boolean(d.body) : true));
    this.opts.canvas.style.cursor = interactive
      ? d.body
        ? "grab"
        : "pointer"
      : "default";
    this.hover =
      !focus && key && key !== "table" && key !== "lamp"
        ? (key as DeskSectionKey)
        : null;
    this.hoverItem = focus && d.itemKey === focus ? (d.item as number) : -1;
  }

  private handleClick(ev: PointerEvent): void {
    this.setPointer(ev);
    const { first, hit } = this.pick();
    const focus = this.focusKey;
    if (focus && first && this.isPresentedNow(first.object)) return;
    const d = hit?.userData ?? {};
    const key = d.key as string | undefined;
    if (key === "lamp") {
      this.toggleLamp();
      return;
    }
    if (!hit || !key || key === "table") {
      if (focus) this.setFocus(null);
      return;
    }
    if (!focus) {
      this.setFocus(key as DeskSectionKey);
      return;
    }
    if (d.itemKey === focus && typeof d.item === "number") {
      this.setItem(d.item);
      return;
    }
    if (key !== focus) this.setFocus(null);
  }

  private readonly tick = (now: number) => {
    // Nunca negativo: um quadro atrasado não pode "voltar no tempo".
    const dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000));
    this.last = Math.max(this.last, now);
    this.elapsed += dt;
    const reduced = this.opts.reducedMotion;
    const a = reduced ? 1 : 1 - Math.exp(-dt * 4.2);
    const focus = this.focusKey;

    this.daylightTimer += dt;
    if (this.daylightTimer > 60) {
      this.daylightTimer = 0;
      this.applyDaylight(false);
    }

    // ---------- câmera ----------
    this.rig.update(dt);
    const look =
      focus || reduced || this.drag?.active
        ? { x: 0, y: 0 }
        : (this.gyro ?? this.sway);
    const view = focus
      ? this.focusView(focus)
      : this.rig.pose(this.aspect, look);
    const goalP = view.p;
    if (this.introT !== null) {
      this.introT += dt;
      const t = easeInOutCubic(Math.min(1, this.introT / INTRO.camera));
      this.camPos.copy(INTRO_START).lerp(goalP, t);
      this.camTarget.copy(view.t);
      const total =
        INTRO.start + INTRO_ORDER.length * INTRO.stagger + INTRO.drop;
      if (this.introT >= Math.max(INTRO.camera, total)) this.finishIntro();
    } else {
      this.camPos.lerp(goalP, a);
      this.camTarget.lerp(view.t, a);
    }
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camTarget);
    this.goalCamera.position.copy(view.p);
    this.goalCamera.lookAt(view.t);

    const frame: FrameState = {
      dt,
      time: this.elapsed,
      focus,
      item: this.item,
      reduced,
    };
    this.updateObjects(frame, a);
    this.updateParts(a, dt);
    this.updatePhysics(dt);
    this.env.update(dt, reduced);
    this.updateOverlay();

    // ---------- profundidade de campo ----------
    const wantBlur = focus && !this.coarse ? 1 : 0;
    this.blur += (wantBlur - this.blur) * (reduced ? 1 : 1 - Math.exp(-dt * 3));
    this.bokeh.enabled = this.blur > 0.01;
    if (this.bokeh.enabled) {
      const u = this.bokeh.uniforms as Record<
        string,
        THREE.IUniform<number> | undefined
      >;
      const { distance, range } = this.focusPlane();
      if (u.focus) u.focus.value = distance;
      if (u.focusRange) u.focusRange.value = range;
      if (u.aperture) u.aperture.value = this.blur * APERTURE;
    }

    this.composer.render(dt);
    this.raf = requestAnimationFrame(this.tick);
  };

  /** Plano de foco entre a peça em destaque e o objeto, para os dois ficarem nítidos. */
  private focusPlane(): { distance: number; range: number } {
    const focus = this.focusKey;
    const toTarget = this.camera.position.distanceTo(this.camTarget);
    const presented = focus
      ? this.kit.parts.find(
          (pt) => pt.present?.key === focus && pt.present.index === this.item,
        )
      : undefined;
    if (!presented) return { distance: toTarget, range: 9 };
    const p = presented.object.getWorldPosition(new THREE.Vector3());
    const toPart = this.camera.position.distanceTo(p);
    return {
      distance: (toPart + toTarget) / 2,
      range: Math.abs(toPart - toTarget) / 2 + 7,
    };
  }

  private dropOffset(key: DeskSectionKey): number {
    if (this.introT === null) return 0;
    const index = INTRO_ORDER.indexOf(key);
    const start = INTRO.start + Math.max(0, index) * INTRO.stagger;
    const t = Math.max(0, Math.min(1, (this.introT - start) / INTRO.drop));
    if (t >= 1 && !this.landed.has(key)) {
      this.landed.add(key);
      this.opts.callbacks.onSound("thud", 0.5);
    }
    return (1 - easeOutBounce(t)) * INTRO.height;
  }

  private updateObjects(frame: FrameState, a: number): void {
    const { dt } = frame;
    for (const o of Object.values(this.kit.objects)) {
      if (!o) continue;
      const up = !frame.focus && this.hover === o.key ? 1.6 : 0;
      const j = o.jiggle;
      j.vx += (-90 * j.x - 9 * j.vx) * dt;
      j.vz += (-90 * j.z - 9 * j.vz) * dt;
      j.x += j.vx * dt;
      j.z += j.vz * dt;
      const drop = this.dropOffset(o.key);
      o.group.position.x = o.base.x + j.x;
      o.group.position.z = o.base.z + j.z;
      const goalY = o.base.y + up + drop;
      o.group.position.y =
        drop > 0
          ? goalY
          : o.group.position.y + (goalY - o.group.position.y) * a;
      o.update?.(frame);
    }
  }

  private updateParts(a: number, dt: number): void {
    const focus = this.focusKey;
    const k = this.item;
    const P = new THREE.Vector3();
    const v = new THREE.Vector3();
    const wp = new THREE.Vector3();
    const tq = new THREE.Quaternion();
    const pq = new THREE.Quaternion();
    const qq = new THREE.Quaternion();
    const qX = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      Math.PI / 2,
    );
    const qY = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      Math.PI,
    );
    const e = new THREE.Euler();
    const kickDecay = Math.exp(-dt * 1.4);
    const wobbleDecay = Math.exp(-dt * 3);

    for (const pt of this.kit.parts) {
      const pr = pt.present;
      let scale: number;
      pt.kick.multiplyScalar(kickDecay);
      pt.wobble *= wobbleDecay;
      if (pr && focus === pr.key && k === pr.index) {
        const off = this.presentOffset(focus);
        this.kit.objects[focus]?.group.getWorldPosition(wp);
        P.copy(wp).add(v.set(off[0], off[1], off[2]));
        tq.copy(this.goalCamera.quaternion);
        if (pr.face === "y") tq.multiply(qX);
        if (pr.face === "back") tq.multiply(qY);
        const parent = pt.object.parent;
        if (!parent) continue;
        parent.updateWorldMatrix(true, false);
        const lp = parent.worldToLocal(P.clone());
        parent.getWorldQuaternion(pq);
        qq.copy(pq.invert()).multiply(tq);
        pt.object.position.lerp(lp, a);
        pt.object.quaternion.slerp(qq, a);
        scale = pr.scale * (this.portrait ? 0.85 : 1);
      } else {
        const g = pt.goal(focus, k);
        const dp = g.dp ?? [0, 0, 0];
        const hv =
          pr && focus === pr.key && this.hoverItem === pr.index ? 2 : 0;
        P.set(
          pt.p0.x + dp[0] + pt.kick.x,
          pt.p0.y + dp[1] + hv,
          pt.p0.z + dp[2] + pt.kick.z,
        );
        pt.object.position.lerp(P, a);
        if (g.r) qq.setFromEuler(e.set(g.r[0], g.r[1], g.r[2]));
        else qq.copy(pt.q0);
        if (pt.wobble > 0.002) {
          const w = pt.wobble;
          qq.multiply(
            new THREE.Quaternion().setFromEuler(
              e.set(
                Math.sin(this.elapsed * 21) * w,
                0,
                Math.cos(this.elapsed * 17) * w,
              ),
            ),
          );
        }
        pt.object.quaternion.slerp(qq, pt.wobble > 0.002 ? 0.6 : a);
        scale = g.s ?? pt.s0;
      }
      pt.object.scale.setScalar(
        pt.object.scale.x + (scale - pt.object.scale.x) * a,
      );
    }
  }

  private updatePhysics(dt: number): void {
    const world = {
      bodies: this.play.bodies,
      obstacles: this.kit.obstacles,
      bounds: {
        minX: -TABLE.width / 2,
        maxX: TABLE.width / 2,
        minZ: -TABLE.depth / 2,
        maxZ: TABLE.depth / 2,
      },
      goal: this.play.goal,
    };
    const before = this.play.bodies.map((b) => [b.x, b.z] as const);
    const events = stepPhysics(world, dt);

    for (const ev of events) {
      if (ev.type === "goal") {
        this.netShake = 1;
        this.goalReturn = 1.8;
        this.opts.callbacks.onSound("goal", 1);
        this.opts.callbacks.onGoal();
      } else if (ev.type === "hit") {
        const volume = Math.min(1, ev.speed / 90);
        const object = this.kit.objects[ev.key as DeskSectionKey];
        if (object) {
          object.jiggle.vx -= ev.nx * ev.speed * 0.05;
          object.jiggle.vz -= ev.nz * ev.speed * 0.05;
          this.kit.parts.forEach((pt) => {
            const tag = partTag(pt);
            if (tag.key !== ev.key) return;
            if (ev.key === "career") {
              const i = tag.item;
              pt.kick.x -= ev.nx * ev.speed * 0.02 * (1 + i * 0.35);
              pt.kick.z -= ev.nz * ev.speed * 0.02 * (1 + i * 0.35);
            } else if (ev.key === "tools") {
              pt.wobble = Math.min(0.22, pt.wobble + ev.speed * 0.003);
            }
          });
        }
        if (ev.key === "net")
          this.netShake = Math.max(this.netShake, volume * 0.6);
        const sound: DeskSound =
          ev.key === "now"
            ? "ceramic"
            : ev.key === "tools"
              ? "wood"
              : ev.key === "net"
                ? "paper"
                : "thud";
        this.opts.callbacks.onSound(sound, volume);
      } else if (ev.type === "wall" || ev.type === "bodies") {
        this.opts.callbacks.onSound("thud", Math.min(1, ev.speed / 120));
      }
    }

    if (this.goalReturn > 0) {
      this.goalReturn -= dt;
      if (this.goalReturn <= 0) {
        const ball = this.play.bodies.find((b) => b.id === "ball");
        if (ball && !ball.dragging) ball.returning = true;
      }
    }

    const drop = this.dropOffset("football");
    this.play.bodies.forEach((body, i) => {
      const [px, pz] = before[i] ?? [body.x, body.z];
      const dx = body.x - px;
      const dz = body.z - pz;
      if (body.id === "ball") {
        const mesh = this.play.ball;
        mesh.position.set(body.x, body.radius + drop, body.z);
        const dist = Math.hypot(dx, dz);
        if (dist > 1e-5) {
          const axis = new THREE.Vector3(dz, 0, -dx).normalize();
          mesh.quaternion.premultiply(
            new THREE.Quaternion().setFromAxisAngle(axis, dist / body.radius),
          );
        } else if (
          this.focusKey === "football" &&
          isHome(body) &&
          !this.opts.reducedMotion
        ) {
          mesh.rotation.x += dt * 1.6;
          mesh.rotation.z += dt * 0.4;
        }
      } else {
        const { outer, roll } = this.play.pencil;
        outer.position.set(body.x, PLANE_Y.pencil + drop, body.z);
        const axis = body.rollAxis ?? 0;
        roll.rotation.x -= (dx * Math.sin(axis) + dz * Math.cos(axis)) / 0.48;
      }
    });

    if (this.netShake > 0.001) {
      this.netShake *= Math.exp(-dt * 3);
      const s = Math.sin(this.elapsed * 26) * this.netShake;
      this.play.net.scale.set(1 + s * 0.12, 1, 1);
      this.play.net.position.x = -Math.abs(s) * 0.8;
    }
  }

  private currentStation(): ViewStation {
    if (this.rig.mode === "seat") return "seat";
    return this.rig.preset ?? nearestPreset(this.rig.orbitTarget);
  }

  /** Onde a câmera vai ficar ao chegar num ponto de vista. */
  private stationCamera(station: ViewStation): THREE.Vector3 {
    if (station === "seat") return new THREE.Vector3(...SEAT_EYE);
    const scale = this.aspect < 1.6 ? Math.min(2.7, 1.6 / this.aspect) : 1;
    const boost = this.portrait ? 0.42 : 0;
    return new THREE.Vector3(
      ...orbitPose(ORBIT_PRESETS[station], scale, boost).position,
    );
  }

  /**
   * Setas de caminho no cenário, como no Street View: cada vizinho vira uma
   * seta numa "bússola" desenhada no chão à frente. A posição e o giro vêm
   * do sentido da caminhada (frente, lados, voltar); subir fica no alto.
   */
  private updateWaypoints(w: number, h: number): void {
    const show =
      !this.focusKey && this.introT === null && this.rig.mode !== "tour";
    const links = show ? STATION_LINKS[this.currentStation()] : [];
    const forward = this.camera.getWorldDirection(new THREE.Vector3());
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3().crossVectors(
      forward,
      new THREE.Vector3(0, 1, 0),
    );
    const cx = w / 2;
    // Bússola baixa, perto do chão, para a seta da frente não cobrir o livro.
    const cy = h * 0.79;
    const rx = Math.min(w * 0.38, 540);
    const ry = h * 0.09;
    const used: { x: number; y: number }[] = [];

    this.waypoints.forEach((el, station) => {
      const visible = links.includes(station);
      el.style.opacity = visible ? "1" : "0";
      el.style.pointerEvents = visible ? "auto" : "none";
      el.tabIndex = visible ? 0 : -1;
      if (!visible) return;

      let x: number;
      let y: number;
      let angle: number;
      if (station === "top") {
        [x, y, angle] = [cx, ARROW_MARGIN.top, 0];
      } else {
        const d = this.stationCamera(station).sub(this.camera.position);
        const side = d.dot(right);
        const ahead = d.dot(forward);
        // Destino quase no mesmo lugar (sentar, por exemplo): é "para trás".
        angle =
          Math.hypot(side, ahead) < 12 ? Math.PI : Math.atan2(side, ahead);
        x = cx + Math.sin(angle) * rx;
        y = cy - Math.cos(angle) * ry;
        angle *= 180 / Math.PI;
      }
      while (used.some((u) => Math.hypot(u.x - x, u.y - y) < 90)) x += 120;
      used.push({ x, y });
      x = Math.max(ARROW_MARGIN.x, Math.min(w - ARROW_MARGIN.x, x));
      y = Math.max(ARROW_MARGIN.top, Math.min(h - ARROW_MARGIN.bottom, y));
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      el.style.setProperty("--arrow-angle", `${angle}deg`);
    });
  }

  private updateOverlay(): void {
    const canvas = this.opts.canvas;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const focus = this.focusKey;
    const v = new THREE.Vector3();
    const hideTags = Boolean(focus) || this.introT !== null;

    this.tags.forEach((el, key) => {
      const o = this.kit.objects[key];
      if (!o) return;
      o.group.getWorldPosition(v);
      v.y += o.anchorY;
      v.project(this.camera);
      const visible =
        !hideTags && v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05;
      const x = (v.x * 0.5 + 0.5) * w;
      const y = (-v.y * 0.5 + 0.5) * h;
      const p = this.pointerPx;
      // O rótulo só aparece com o mouse perto (ou sobre o objeto);
      // longe, fica só a bolinha pulsando.
      const near =
        this.hover === key ||
        (p !== null && Math.hypot(p.x - x, p.y - y) < TAG_NEAR_PX);
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      el.style.opacity = visible ? "1" : "0";
      el.style.pointerEvents = visible ? "auto" : "none";
      el.tabIndex = visible ? 0 : -1;
      el.dataset.near = near ? "true" : "false";
    });

    this.updateWaypoints(w, h);

    const fl = this.float;
    if (!fl) return;
    let show = false;
    if (focus) {
      const presented = this.kit.parts.find(
        (pt) =>
          pt.present &&
          pt.present.key === focus &&
          pt.present.index === this.item,
      );
      if (presented) {
        const box = new THREE.Box3().setFromObject(presented.object);
        v.set(
          (box.min.x + box.max.x) / 2,
          box.max.y,
          (box.min.z + box.max.z) / 2,
        );
        show = true;
      } else {
        const anchor = FOCUS[focus].anchor;
        const o = this.kit.objects[focus];
        if (anchor && o) {
          o.group.getWorldPosition(v);
          v.add(new THREE.Vector3(...anchor));
          show = true;
        }
      }
    }
    if (show) {
      v.project(this.camera);
      const x = Math.max(110, Math.min(w - 110, (v.x * 0.5 + 0.5) * w));
      const y = Math.max(140, (-v.y * 0.5 + 0.5) * h - 12);
      fl.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
      fl.style.opacity = "1";
      fl.style.pointerEvents = "auto";
    } else {
      fl.style.transform = "translate(-9999px, 0)";
      fl.style.opacity = "0";
      fl.style.pointerEvents = "none";
    }
  }
}
