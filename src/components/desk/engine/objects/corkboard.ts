import * as THREE from "three";

import { cycle } from "@/lib/desk";

import { drawCover, font, wrapText } from "../paint";
import { DESK_TEXTURES, type SceneKit } from "../scene-kit";

const PIN_COLORS = [0xc9533d, 0x2f5d8a, 0x1e6b52, 0xb38a2e];
const TILTS = [-0.06, 0.05, -0.03, 0.07, -0.05, 0.03, -0.07, 0.05, -0.02];

/** Mural de cortiça com as polaroids de quem me inspira. */
export function buildCorkboard(kit: SceneKit): void {
  const { fonts, std, mesh, materials } = kit;
  const people = kit.content.inspirations;
  const board = new THREE.Group();
  board.position.set(-56, 0, -22);
  board.rotation.y = 0.28;

  const frame = new THREE.Group();
  frame.position.y = 16;
  frame.rotation.x = -0.22;
  frame.add(mesh(new THREE.BoxGeometry(42, 30, 1.6), materials.oak));
  const cork = mesh(
    new THREE.PlaneGeometry(38, 26),
    std({ map: kit.texture(DESK_TEXTURES.cork, [2, 1.4]), roughness: 0.95 }),
  );
  cork.position.z = 0.82;
  frame.add(cork);

  people.forEach((p, i) => {
    const back = kit.painter(700, 840, (g, w, h, img) => {
      g.fillStyle = "#FFFEFA";
      g.fillRect(0, 0, w, h);
      if (img) drawCover(g, img, 40, 40, 620, 400);
      g.fillStyle = "#1D1B18";
      g.font = font(62, fonts.serif);
      wrapText(g, p.title, 40, 520, 620, 60);
      g.fillStyle = "#3E3A33";
      g.font = font(24, fonts.mono);
      wrapText(g, p.text, 40, 600, 620, 36);
    });
    const photo = kit.painter(256, 256, (g, w, h, img) => {
      g.fillStyle = "#D9D3C7";
      g.fillRect(0, 0, w, h);
      if (img) drawCover(g, img, 0, 0, w, h);
    });
    if (p.image) {
      back.setImage(p.image);
      photo.setImage(p.image);
    }
    const group = new THREE.Group();
    group.add(
      mesh(
        new THREE.BoxGeometry(7, 8.4, 0.2),
        std({ color: 0xfffefa, roughness: 0.8 }),
      ),
    );
    const ph = new THREE.Mesh(
      new THREE.PlaneGeometry(6.2, 6.2),
      std({ map: photo.texture, roughness: 0.7 }),
    );
    ph.position.set(0, 0.7, 0.11);
    group.add(ph);
    const bk = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 8.4),
      std({ map: back.texture, roughness: 0.8 }),
    );
    bk.rotation.y = Math.PI;
    bk.position.z = -0.11;
    group.add(bk);
    const pin = mesh(
      new THREE.SphereGeometry(0.45, 16, 12),
      std({ color: cycle(PIN_COLORS, i), roughness: 0.4 }),
    );
    pin.position.set(0, 3.7, 0.4);
    group.add(pin);
    group.position.set(-11 + (i % 3) * 11, 8.2 - Math.floor(i / 3) * 8.7, 1);
    group.rotation.z = cycle(TILTS, i);
    kit.tagItem(group, "inspirations", i);
    frame.add(group);
    kit.addPart(group, null, {
      key: "inspirations",
      index: i,
      face: "back",
      scale: 2.6,
    });
  });

  board.add(frame);
  const ledge = mesh(new THREE.BoxGeometry(42, 1, 4), materials.oak);
  ledge.position.set(0, 1, 1.5);
  board.add(ledge);
  const leg = mesh(new THREE.BoxGeometry(1.4, 26, 1.4), materials.oak);
  leg.position.set(0, 12, -6);
  leg.rotation.x = 0.35;
  board.add(leg);

  kit.register("inspirations", board, 34);
  kit.obstacles.push({
    key: "inspirations",
    kind: "box",
    x: -56,
    z: -21,
    hw: 21,
    hd: 5,
  });
}
