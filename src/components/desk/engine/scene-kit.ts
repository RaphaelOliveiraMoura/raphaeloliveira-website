import * as THREE from "three";

import type {
  DeskContent,
  DeskMessages,
  DeskSectionKey,
} from "@/components/desk/desk-content";

import type { Obstacle, TerminalStrings } from "@/lib/desk";

import {
  createPainter,
  type DeskFonts,
  type Painter,
  type PaintFn,
} from "./paint";

export type Vec3 = [number, number, number];

export interface PresentConfig {
  key: DeskSectionKey;
  index: number;
  face: "z" | "y" | "back";
  scale: number;
}

export interface PartGoal {
  dp?: Vec3;
  r?: Vec3;
  s?: number;
}

export interface FrameState {
  dt: number;
  time: number;
  focus: DeskSectionKey | null;
  item: number;
  reduced: boolean;
}

export interface Part {
  object: THREE.Object3D;
  p0: THREE.Vector3;
  q0: THREE.Quaternion;
  s0: number;
  goal: (focus: DeskSectionKey | null, item: number) => PartGoal;
  present: PresentConfig | null;
  /** Deslocamento temporário (empurrão da bola), que volta a zero sozinho. */
  kick: THREE.Vector3;
  wobble: number;
}

export interface Jiggle {
  x: number;
  z: number;
  vx: number;
  vz: number;
}

export interface DeskObject {
  key: DeskSectionKey;
  group: THREE.Group;
  base: THREE.Vector3;
  anchorY: number;
  update?: (frame: FrameState) => void;
  jiggle: Jiggle;
}

export interface DeskEngineStrings {
  locale: string;
  canvas: DeskMessages["canvas"];
  notebook: DeskMessages["notebook"];
  terminal: TerminalStrings;
}

export interface SceneKit {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  fonts: DeskFonts;
  content: DeskContent;
  strings: DeskEngineStrings;
  hits: THREE.Object3D[];
  objects: Partial<Record<DeskSectionKey, DeskObject>>;
  parts: Part[];
  obstacles: Obstacle[];
  redraws: (() => void)[];
  materials: {
    paper: THREE.MeshStandardMaterial;
    card: THREE.MeshStandardMaterial;
    oak: THREE.MeshStandardMaterial;
    dark: THREE.MeshStandardMaterial;
    brass: THREE.MeshStandardMaterial;
  };
  std: (
    params: THREE.MeshStandardMaterialParameters,
  ) => THREE.MeshStandardMaterial;
  mesh: (
    geometry: THREE.BufferGeometry,
    material: THREE.Material | THREE.Material[],
  ) => THREE.Mesh;
  texture: (url: string, repeat?: [number, number]) => THREE.Texture;
  painter: (w: number, h: number, paint: PaintFn) => Painter;
  tagItem: (object: THREE.Object3D, key: DeskSectionKey, index: number) => void;
  addPart: (
    object: THREE.Object3D,
    goal?: Part["goal"] | null,
    present?: PresentConfig | null,
  ) => Part;
  register: (
    key: DeskSectionKey,
    group: THREE.Group,
    anchorY: number,
    update?: (frame: FrameState) => void,
  ) => DeskObject;
}

export const DESK_TEXTURES = {
  oak: "/images/desk/oak.jpg",
  cork: "/images/desk/cork.jpg",
  cover: "/images/desk/cover.jpg",
  grass: "/images/desk/grass.jpg",
} as const;

export function createSceneKit(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  fonts: DeskFonts,
  content: DeskContent,
  strings: DeskEngineStrings,
): SceneKit {
  const loader = new THREE.TextureLoader();
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  const hits: THREE.Object3D[] = [];
  const parts: Part[] = [];
  const redraws: (() => void)[] = [];
  const objects: SceneKit["objects"] = {};

  const std = (params: THREE.MeshStandardMaterialParameters) =>
    new THREE.MeshStandardMaterial(params);

  const texture = (url: string, repeat?: [number, number]) => {
    const t = loader.load(url);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAnisotropy;
    if (repeat) {
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(repeat[0], repeat[1]);
    }
    return t;
  };

  const kit: SceneKit = {
    renderer,
    scene,
    fonts,
    content,
    strings,
    hits,
    objects,
    parts,
    obstacles: [],
    redraws,
    materials: {
      paper: std({ color: 0xf6f1e6, roughness: 0.9 }),
      card: std({ color: 0xfffdf7, roughness: 0.9 }),
      oak: std({ map: texture(DESK_TEXTURES.oak), roughness: 0.65 }),
      dark: std({ color: 0x1d1b18, roughness: 0.8 }),
      brass: std({ color: 0xb08d48, metalness: 0.85, roughness: 0.35 }),
    },
    std,
    texture,
    mesh: (geometry, material) => {
      const m = new THREE.Mesh(geometry, material);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    },
    painter: (w, h, paint) => {
      const p = createPainter(w, h, paint);
      redraws.push(p.redraw);
      return p;
    },
    tagItem: (object, key, index) => {
      object.traverse((m) => {
        if ((m as THREE.Mesh).isMesh) {
          m.userData.item = index;
          m.userData.itemKey = key;
        }
      });
    },
    addPart: (object, goal, present) => {
      const part: Part = {
        object,
        p0: object.position.clone(),
        q0: object.quaternion.clone(),
        s0: object.scale.x,
        goal: goal ?? (() => ({})),
        present: present ?? null,
        kick: new THREE.Vector3(),
        wobble: 0,
      };
      if (present) {
        object.traverse((m) => {
          m.userData.presented = true;
        });
      }
      parts.push(part);
      return part;
    },
    register: (key, group, anchorY, update) => {
      group.traverse((o) => {
        if ((o as THREE.Mesh).isMesh && !o.userData.noHit) {
          o.userData.key = key;
          hits.push(o);
        }
      });
      const entry: DeskObject = {
        key,
        group,
        base: group.position.clone(),
        anchorY,
        update,
        jiggle: { x: 0, z: 0, vx: 0, vz: 0 },
      };
      objects[key] = entry;
      scene.add(group);
      return entry;
    },
  };
  return kit;
}
