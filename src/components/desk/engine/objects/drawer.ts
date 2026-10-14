import * as THREE from "three";

import { cycle } from "@/lib/desk";

import { drawCover, font, ruledBackground, wrapText } from "../paint";
import type { SceneKit } from "../scene-kit";

const TAB_X = [-9, -2.6, 3.8, 9.2, -5.8, 6.4];

/** Gaveta de catálogo com uma ficha por projeto. */
export function buildDrawer(kit: SceneKit): void {
  const { fonts, std, mesh, materials } = kit;
  const projects = kit.content.projects;
  const drawer = new THREE.Group();
  drawer.position.set(52, 0, -20);
  drawer.rotation.y = -0.2;

  const floor = mesh(new THREE.BoxGeometry(30, 1, 22), materials.oak);
  floor.position.y = 0.5;
  drawer.add(floor);
  const walls: [number, number, number, number, number, number][] = [
    [0, 5, -10.5, 30, 9, 1],
    [0, 5, 10.5, 30, 9, 1],
    [-14.5, 5, 0, 1, 9, 22],
    [14.5, 5, 0, 1, 9, 22],
  ];
  walls.forEach(([x, y, z, w, h, d]) => {
    const wall = mesh(new THREE.BoxGeometry(w, h, d), materials.oak);
    wall.position.set(x, y, z);
    drawer.add(wall);
  });
  const pull = mesh(
    new THREE.TorusGeometry(2.2, 0.35, 10, 24, Math.PI),
    materials.brass,
  );
  pull.position.set(0, 4.2, 11.2);
  pull.rotation.z = Math.PI;
  drawer.add(pull);
  const holder = mesh(new THREE.BoxGeometry(7, 2.4, 0.3), materials.brass);
  holder.position.set(0, 7.2, 11.1);
  drawer.add(holder);

  const total = String(projects.length).padStart(2, "0");
  projects.forEach((p, i) => {
    const face = kit.painter(1080, 440, (g, w, h, img) => {
      ruledBackground(g, w, h, 78, 40);
      g.fillStyle = "#6E685C";
      g.font = font(22, fonts.mono, "500");
      g.fillText(p.label, 40, 52);
      g.textAlign = "right";
      g.fillText(`${String(i + 1).padStart(2, "0")} / ${total}`, w - 40, 52);
      g.textAlign = "left";
      g.fillStyle = "#1D1B18";
      g.font = font(80, fonts.serif);
      g.fillText(p.title, 40, 190);
      g.fillStyle = "#3E3A33";
      g.font = font(25, fonts.mono);
      wrapText(g, p.text, 40, 252, 560, 40);
      g.fillStyle = "#6E685C";
      g.font = font(21, fonts.mono);
      g.fillText(p.meta, 40, 404);
      if (img) {
        g.translate(w - 235, 248);
        g.rotate(0.035);
        g.shadowColor = "rgba(40,30,10,0.35)";
        g.shadowBlur = 20;
        g.fillStyle = "#FFFFFF";
        g.fillRect(-187, -137, 374, 274);
        g.shadowBlur = 0;
        drawCover(g, img, -175, -125, 350, 250);
      }
    });
    if (p.image) face.setImage(p.image);
    const tab = kit.painter(350, 100, (g, w) => {
      g.fillStyle = "#FFFDF7";
      g.fillRect(0, 0, w, 100);
      g.fillStyle = "#1D1B18";
      g.font = font(34, fonts.mono, "500");
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(p.short, w / 2, 54);
    });
    const card = materials.card;
    const group = new THREE.Group();
    const body = mesh(new THREE.BoxGeometry(27, 11, 0.25), [
      card,
      card,
      card,
      card,
      std({ map: face.texture, roughness: 0.85 }),
      card,
    ]);
    body.position.y = 6.6;
    group.add(body);
    const tabMesh = mesh(new THREE.BoxGeometry(8.4, 2.6, 0.25), [
      card,
      card,
      card,
      card,
      std({ map: tab.texture, roughness: 0.85 }),
      card,
    ]);
    tabMesh.position.set(cycle(TAB_X, i), 13.2, 0);
    group.add(tabMesh);
    group.position.set(0, 0, -7.5 + i * 3);
    kit.tagItem(group, "projects", i);
    drawer.add(group);
    kit.addPart(group, null, {
      key: "projects",
      index: i,
      face: "z",
      scale: 1.35,
    });
  });

  kit.register("projects", drawer, 16);
  kit.obstacles.push({
    key: "projects",
    kind: "box",
    x: 52,
    z: -20,
    hw: 16,
    hd: 13,
  });
}
