import * as THREE from "three";

import { cycle } from "@/lib/desk";

import { createCanvasTexture, font, getContext, wrapText } from "../paint";
import type { SceneKit } from "../scene-kit";

const NOTE_COLORS = ["#F6E27A", "#F7A8C4", "#A8E0B5", "#A9D3F5"];
const NOTE_SPOTS: [number, number, number][] = [
  [-9, 5, -0.3],
  [9, -4, 0.25],
  [-8, -7, 0.2],
  [10, 7, -0.2],
];

/** Caneca de café com post-its do "agora" em volta. */
export function buildMug(kit: SceneKit): void {
  const { fonts, std, mesh, materials } = kit;
  const notes = kit.content.now;
  const mug = new THREE.Group();
  mug.position.set(26, 0, -32);

  const ceramic = std({
    color: 0xefe9de,
    roughness: 0.35,
    side: THREE.DoubleSide,
  });
  const body = mesh(
    new THREE.CylinderGeometry(4.2, 3.9, 9, 48, 1, true),
    ceramic,
  );
  body.position.y = 4.5;
  mug.add(body);
  const bottom = mesh(new THREE.CircleGeometry(3.9, 40), ceramic);
  bottom.rotation.x = -Math.PI / 2;
  bottom.position.y = 0.3;
  mug.add(bottom);
  const coffee = mesh(
    new THREE.CircleGeometry(4.05, 40),
    std({ color: 0x2e1a10, roughness: 0.12 }),
  );
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.y = 7.6;
  mug.add(coffee);
  const handle = mesh(new THREE.TorusGeometry(2.4, 0.62, 12, 30), ceramic);
  handle.position.set(4.6, 4.6, 0);
  mug.add(handle);

  const steamTex = createCanvasTexture(64, 64);
  const sg = getContext(steamTex);
  const grad = sg.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, "rgba(255,255,255,0.9)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  sg.fillStyle = grad;
  sg.fillRect(0, 0, 64, 64);
  steamTex.needsUpdate = true;
  const steams = [0, 1, 2].map((i) => {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: steamTex,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    sprite.userData.noHit = true;
    mug.add(sprite);
    return { sprite, t: i / 3, seed: i * 2.1 };
  });

  notes.forEach((p, i) => {
    const [x, z, ry] = cycle(NOTE_SPOTS, i);
    const note = kit.painter(600, 600, (g, w, h) => {
      g.fillStyle = cycle(NOTE_COLORS, i);
      g.fillRect(0, 0, w, h);
      g.fillStyle = "rgba(0,0,0,0.06)";
      g.fillRect(0, 0, w, 40);
      g.fillStyle = "#5A4E2A";
      g.font = font(20, fonts.mono, "500");
      g.fillText(p.label, 36, 90);
      g.fillStyle = "#2A2410";
      g.font = font(56, fonts.hand);
      wrapText(g, p.title, 36, 190, 530, 64);
      g.font = font(30, fonts.hand);
      wrapText(g, p.text, 36, 330, 530, 48);
    });
    const card = materials.card;
    const n = mesh(new THREE.BoxGeometry(6, 0.15, 6), [
      card,
      card,
      std({ map: note.texture, roughness: 0.9 }),
      card,
      card,
      card,
    ]);
    n.position.set(x, 0.08, z);
    n.rotation.y = ry;
    kit.tagItem(n, "now", i);
    mug.add(n);
    kit.addPart(n, null, { key: "now", index: i, face: "y", scale: 3 });
  });

  kit.register("now", mug, 16, ({ dt }) => {
    steams.forEach((s) => {
      s.t = (s.t + dt * 0.35) % 1;
      s.sprite.position.set(Math.sin((s.t + s.seed) * 6) * 0.8, 9 + s.t * 9, 0);
      s.sprite.material.opacity = Math.sin(s.t * Math.PI) * 0.35;
      s.sprite.scale.setScalar(3 + s.t * 4);
    });
  });
  kit.obstacles.push({ key: "now", kind: "circle", x: 27, z: -32, r: 5 });
}
