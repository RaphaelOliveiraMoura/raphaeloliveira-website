import * as THREE from "three";

import type { Daylight } from "@/lib/desk";

import { createCanvasTexture, getContext } from "./paint";
import { DESK_TEXTURES, type SceneKit } from "./scene-kit";

export const TABLE = { width: 176, depth: 112 } as const;

const SUN_DISTANCE = 170;
const WINDOW_DISTANCE = 92;
const WINDOW_CENTER = new THREE.Vector3(-10, 0, 0);
const LAMP_BASE = new THREE.Vector3(76, 0, -46);
const LAMP_HEAD = new THREE.Vector3(62, 30, -36);
const LAMP_TARGET = new THREE.Vector3(6, 0, 2);
const SUN_SCALE = 3.1;
const AMBIENT_SCALE = 2.7;
const LAMP_INTENSITY = 24000;
/** Luz rebatida da luminária: clareia a mesa toda, sem sombra. */
const LAMP_FILL = 1.6;
/** Quanto a exposição sobe com a luminária acesa (o olho se adapta). */
const LAMP_EXPOSURE = 0.18;

export interface Environment {
  /** Caixilho só de sombra: precisa sumir do passe de profundidade do desfoque. */
  windowFrame: THREE.Object3D;
  applyDaylight: (daylight: Daylight) => void;
  setLamp: (on: boolean) => void;
  update: (dt: number, reduced: boolean) => void;
}

function segment(
  kit: SceneKit,
  from: THREE.Vector3,
  to: THREE.Vector3,
  radius: number,
  material: THREE.Material,
): THREE.Mesh {
  const length = from.distanceTo(to);
  const m = kit.mesh(
    new THREE.CylinderGeometry(radius, radius, length, 16),
    material,
  );
  m.position.copy(from).add(to).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    to.clone().sub(from).normalize(),
  );
  return m;
}

function buildLamp(kit: SceneKit) {
  const { std, mesh } = kit;
  const metal = std({ color: 0x2b2a28, metalness: 0.6, roughness: 0.4 });
  const lamp = new THREE.Group();
  const base = mesh(new THREE.CylinderGeometry(5, 5.6, 1.4, 40), metal);
  base.position.copy(LAMP_BASE).setY(0.7);
  lamp.add(base);
  const elbow = new THREE.Vector3(LAMP_BASE.x + 2, 22, LAMP_BASE.z + 1);
  lamp.add(
    segment(
      kit,
      new THREE.Vector3(LAMP_BASE.x, 1.4, LAMP_BASE.z),
      elbow,
      0.45,
      metal,
    ),
  );
  lamp.add(segment(kit, elbow, LAMP_HEAD, 0.45, metal));
  const joint = mesh(new THREE.SphereGeometry(0.9, 16, 12), metal);
  joint.position.copy(elbow);
  lamp.add(joint);

  const head = new THREE.Group();
  head.position.copy(LAMP_HEAD);
  head.lookAt(LAMP_TARGET);
  const shade = mesh(
    new THREE.ConeGeometry(4.4, 6, 32, 1, true),
    std({ color: 0x1e6b52, roughness: 0.55, side: THREE.DoubleSide }),
  );
  // O cone nasce no eixo Y; deita para apontar para o alvo (eixo Z local).
  shade.rotation.x = -Math.PI / 2;
  shade.position.z = 1.5;
  // A cúpula não pode bloquear a própria luz da luminária.
  shade.castShadow = false;
  head.add(shade);
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xfff3dc,
    emissive: 0xffd9a0,
    emissiveIntensity: 0,
  });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(1.5, 20, 16), bulbMat);
  bulb.position.z = 3;
  head.add(bulb);
  lamp.add(head);

  const spot = new THREE.SpotLight(0xffd6a0, 0, 0, 1.0, 0.8, 1.7);
  spot.position
    .copy(LAMP_HEAD)
    .add(LAMP_TARGET.clone().sub(LAMP_HEAD).normalize().multiplyScalar(3));
  spot.target.position.copy(LAMP_TARGET);
  spot.castShadow = true;
  spot.shadow.mapSize.set(2048, 2048);
  spot.shadow.bias = -0.0008;
  spot.shadow.normalBias = 0.03;
  spot.shadow.radius = 4;
  kit.scene.add(spot, spot.target);

  lamp.traverse((o) => {
    o.userData.key = "lamp";
    if ((o as THREE.Mesh).isMesh) kit.hits.push(o);
  });
  kit.scene.add(lamp);
  kit.obstacles.push({
    key: "lamp",
    kind: "circle",
    x: LAMP_BASE.x,
    z: LAMP_BASE.z,
    r: 5.4,
  });
  return { spot, bulbMat };
}

/** Caixilho invisível que só projeta sombra: as "janelas" sobre a mesa. */
function buildWindowFrame(kit: SceneKit): THREE.Group {
  const frame = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({
    colorWrite: false,
    depthWrite: false,
  });
  // Só a luz do sol (câmera de sombra ortográfica) enxerga o caixilho;
  // na sombra da luminária (perspectiva) a geometria é jogada para fora do quadro.
  const sunOnlyDepth = new THREE.MeshDepthMaterial();
  sunOnlyDepth.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      "#include <project_vertex>",
      "#include <project_vertex>\n  if ( projectionMatrix[ 3 ][ 3 ] < 0.5 ) gl_Position = vec4( 2.0, 2.0, 2.0, 1.0 );",
    );
  };
  const bar = (w: number, h: number, x: number, y: number) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1), material);
    m.position.set(x, y, 0);
    m.castShadow = true;
    m.customDepthMaterial = sunOnlyDepth;
    frame.add(m);
  };
  const W = 150;
  const H = 110;
  bar(W, 3, 0, H / 2);
  bar(W, 3, 0, -H / 2);
  bar(3, H, -W / 2, 0);
  bar(3, H, W / 2, 0);
  bar(2.2, H, -W / 6, 0);
  bar(2.2, H, W / 6, 0);
  bar(W, 2.2, 0, 0);
  kit.scene.add(frame);
  return frame;
}

function paintBackground(
  texture: THREE.CanvasTexture,
  [inner, outer]: [string, string],
) {
  const g = getContext(texture);
  const { width: w, height: h } = texture.image as HTMLCanvasElement;
  const grad = g.createRadialGradient(
    w / 2,
    h * 0.35,
    0,
    w / 2,
    h * 0.35,
    w * 0.75,
  );
  grad.addColorStop(0, inner);
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
  texture.needsUpdate = true;
}

export function buildEnvironment(kit: SceneKit): Environment {
  const { scene, std, mesh } = kit;

  const background = createCanvasTexture(512, 320);
  scene.background = background;

  const table = mesh(
    new THREE.BoxGeometry(TABLE.width, 4, TABLE.depth),
    std({ map: kit.texture(DESK_TEXTURES.oak, [2.4, 1.5]), roughness: 0.75 }),
  );
  table.position.y = -2;
  table.castShadow = false;
  table.userData.key = "table";
  kit.hits.push(table);
  scene.add(table);

  const hemi = new THREE.HemisphereLight(0xfff4e6, 0x8c7b66, 2.3);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1dc, 3.9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = -120;
  sc.right = 120;
  sc.top = 95;
  sc.bottom = -95;
  sc.near = 1;
  sc.far = 420;
  sun.shadow.bias = -0.0005;
  sun.shadow.radius = 3;
  scene.add(sun, sun.target);

  const windowFrame = buildWindowFrame(kit);
  const { spot, bulbMat } = buildLamp(kit);
  const lampFill = new THREE.HemisphereLight(0xffd2a0, 0x6b4a2e, 0);
  scene.add(lampFill);

  let lampTarget = 0;
  let lampLevel = 0;
  let baseExposure = 1;
  // De dia a luminária quase não muda a cena; à noite ela carrega a mesa.
  let darkness = 0;

  return {
    windowFrame,
    applyDaylight: (d) => {
      const dir = new THREE.Vector3(...d.sunDirection);
      sun.position.copy(dir).multiplyScalar(SUN_DISTANCE);
      sun.target.position.set(0, 0, 0);
      sun.color.setHex(d.sunColor);
      sun.intensity = d.sunIntensity * SUN_SCALE;
      hemi.color.setHex(d.skyColor);
      hemi.groundColor.setHex(d.groundColor);
      hemi.intensity = d.ambientIntensity * AMBIENT_SCALE;
      baseExposure = d.exposure;
      darkness = Math.min(1, Math.max(0, 1 - d.sunIntensity));
      windowFrame.position
        .copy(WINDOW_CENTER)
        .addScaledVector(dir, WINDOW_DISTANCE);
      windowFrame.lookAt(WINDOW_CENTER);
      paintBackground(background, d.background);
    },
    setLamp: (on) => {
      lampTarget = on ? 1 : 0;
    },
    update: (dt, reduced) => {
      const a = reduced ? 1 : 1 - Math.exp(-dt * 10);
      lampLevel += (lampTarget - lampLevel) * a;
      spot.intensity = lampLevel * LAMP_INTENSITY;
      lampFill.intensity = lampLevel * LAMP_FILL * (0.25 + 0.75 * darkness);
      bulbMat.emissiveIntensity = lampLevel * 3;
      kit.renderer.toneMappingExposure =
        baseExposure + lampLevel * LAMP_EXPOSURE * darkness;
    },
  };
}
