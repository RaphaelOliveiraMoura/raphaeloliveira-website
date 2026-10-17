import * as THREE from "three";

import {
  type CameraPose,
  clampOrbit,
  clampSeat,
  ORBIT_PRESETS,
  orbitPose,
  type OrbitState,
  SEAT_REST,
  seatPose,
  type SeatState,
  type ViewMode,
  type ViewPreset,
} from "@/lib/desk";

/** Giro por largura de tela arrastada (rad). */
const DRAG_YAW = 2.4;
const DRAG_ELEVATION = 1.8;
const SEAT_DRAG_YAW = 2;
const SEAT_DRAG_PITCH = 1.4;
const INERTIA_DECAY = 5;
const FLY_ZOOM = 0.5;

function cloneOrbit(s: OrbitState): OrbitState {
  return { ...s, target: [...s.target] };
}

function toVectors(pose: CameraPose): { p: THREE.Vector3; t: THREE.Vector3 } {
  return {
    p: new THREE.Vector3(...pose.position),
    t: new THREE.Vector3(...pose.target),
  };
}

/**
 * Câmera fora do foco: órbita com inércia, zoom e voo até um ponto, ou a
 * vista de quem está sentado na cadeira. O foco nos objetos continua no motor.
 */
export class CameraRig {
  mode: ViewMode;
  preset: ViewPreset | null = "home";
  tourIndex = -1;

  private readonly reduced: boolean;
  private orbit = cloneOrbit(ORBIT_PRESETS.home);
  private orbitGoal = cloneOrbit(ORBIT_PRESETS.home);
  private velocity = { yaw: 0, elevation: 0 };
  private seat: SeatState = { ...SEAT_REST };
  private seatGoal: SeatState = { ...SEAT_REST };
  private dragging = false;

  constructor(mode: ViewMode, reduced: boolean) {
    this.mode = mode;
    this.reduced = reduced;
  }

  setMode(mode: ViewMode): void {
    this.mode = mode;
    if (mode === "seat") this.seatGoal = { ...SEAT_REST };
    if (mode === "tour") this.tourIndex = -1;
  }

  setPreset(preset: ViewPreset): void {
    this.mode = "orbit";
    this.preset = preset;
    this.orbitGoal = cloneOrbit(ORBIT_PRESETS[preset]);
    this.velocity = { yaw: 0, elevation: 0 };
  }

  beginDrag(): void {
    this.dragging = true;
    this.velocity = { yaw: 0, elevation: 0 };
  }

  /** `dx`/`dy` em frações da tela; `dt` em segundos desde o último movimento. */
  dragBy(dx: number, dy: number, dt: number): void {
    if (this.mode === "seat") {
      this.seatGoal = clampSeat({
        ...this.seatGoal,
        yaw: this.seatGoal.yaw + dx * SEAT_DRAG_YAW,
        pitch: this.seatGoal.pitch + dy * SEAT_DRAG_PITCH,
      });
      return;
    }
    const yaw = -dx * DRAG_YAW;
    const elevation = dy * DRAG_ELEVATION;
    this.orbitGoal = clampOrbit({
      ...this.orbitGoal,
      yaw: this.orbitGoal.yaw + yaw,
      elevation: this.orbitGoal.elevation + elevation,
    });
    if (dt > 0) {
      this.velocity = {
        yaw: this.velocity.yaw * 0.5 + (yaw / dt) * 0.5,
        elevation: this.velocity.elevation * 0.5 + (elevation / dt) * 0.5,
      };
    }
    this.preset = null;
  }

  endDrag(still: boolean): void {
    this.dragging = false;
    if (still || this.reduced) this.velocity = { yaw: 0, elevation: 0 };
  }

  /** Rodinha ou pinça: aproxima na órbita, inclina o corpo na cadeira. */
  zoomBy(factor: number): void {
    if (this.mode === "seat") {
      this.seatGoal = clampSeat({
        ...this.seatGoal,
        lean: this.seatGoal.lean + (1 - factor) * 2,
      });
      return;
    }
    this.orbitGoal = clampOrbit({
      ...this.orbitGoal,
      zoom: this.orbitGoal.zoom * factor,
    });
    this.preset = null;
  }

  /** Duplo clique no tampo: voa até o ponto, mais de perto. */
  flyTo(point: THREE.Vector3): void {
    this.orbitGoal = clampOrbit({
      ...this.orbitGoal,
      zoom: Math.min(this.orbitGoal.zoom, FLY_ZOOM),
      target: [point.x, 0, point.z],
    });
    this.velocity = { yaw: 0, elevation: 0 };
    this.preset = null;
  }

  update(dt: number): void {
    if (!this.dragging && !this.reduced) {
      const decay = Math.exp(-dt * INERTIA_DECAY);
      this.velocity.yaw *= decay;
      this.velocity.elevation *= decay;
      if (
        Math.abs(this.velocity.yaw) + Math.abs(this.velocity.elevation) >
        1e-3
      ) {
        this.orbitGoal = clampOrbit({
          ...this.orbitGoal,
          yaw: this.orbitGoal.yaw + this.velocity.yaw * dt,
          elevation: this.orbitGoal.elevation + this.velocity.elevation * dt,
        });
      }
    }
    const a = this.reduced ? 1 : 1 - Math.exp(-dt * 9);
    const o = this.orbit;
    const g = this.orbitGoal;
    o.yaw += (g.yaw - o.yaw) * a;
    o.elevation += (g.elevation - o.elevation) * a;
    o.zoom += (g.zoom - o.zoom) * a;
    o.target = [
      o.target[0] + (g.target[0] - o.target[0]) * a,
      o.target[1] + (g.target[1] - o.target[1]) * a,
      o.target[2] + (g.target[2] - o.target[2]) * a,
    ];
    const s = this.seat;
    const sg = this.seatGoal;
    s.yaw += (sg.yaw - s.yaw) * a;
    s.pitch += (sg.pitch - s.pitch) * a;
    s.lean += (sg.lean - s.lean) * a;
  }

  /**
   * Pose atual. `look` é o olhar leve do mouse/giroscópio (-1..1);
   * `aspect` ajusta a órbita para telas estreitas.
   */
  pose(
    aspect: number,
    look: { x: number; y: number },
  ): {
    p: THREE.Vector3;
    t: THREE.Vector3;
  } {
    if (this.mode === "seat") {
      return toVectors(
        seatPose({
          ...this.seat,
          yaw: this.seat.yaw - look.x * 0.12,
          pitch: this.seat.pitch + look.y * 0.06,
        }),
      );
    }
    const distanceScale = aspect < 1.6 ? Math.min(2.7, 1.6 / aspect) : 1;
    const pose = toVectors(
      orbitPose(this.orbit, distanceScale, aspect < 0.9 ? 0.42 : 0),
    );
    pose.p.add(new THREE.Vector3(look.x * 4, look.y * 2, 0));
    return pose;
  }
}
