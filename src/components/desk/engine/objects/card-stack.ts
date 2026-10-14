import * as THREE from "three";

import { font, ruledBackground, wrapText } from "../paint";
import type { SceneKit } from "../scene-kit";

/** Pilha de fichas da trajetória; no foco ela abre em leque. */
export function buildCardStack(kit: SceneKit): void {
  const { fonts, std, mesh, materials } = kit;
  const items = kit.content.career;
  const stack = new THREE.Group();
  stack.position.set(52, 0, 24);
  stack.rotation.y = 0.12;
  const mid = (items.length - 1) / 2;

  items.forEach((p, i) => {
    const year = p.label.match(/\d{4}/)?.[0] ?? "";
    const isEducation = p.id === "una";
    const face = kit.painter(1000, 600, (g, w) => {
      ruledBackground(g, w, 600, 90, 46, isEducation ? "#5B6B8A" : "#C9533D");
      g.fillStyle = "#6E685C";
      g.font = font(24, fonts.mono, "500");
      g.fillText(p.label, 44, 58);
      g.save();
      g.translate(w - 150, 170);
      g.rotate(-0.12);
      g.strokeStyle = "#B4432F";
      g.lineWidth = 5;
      g.strokeRect(-95, -40, 190, 80);
      g.fillStyle = "#B4432F";
      g.font = font(44, fonts.mono, "500");
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(year, 0, 4);
      g.restore();
      g.fillStyle = "#1D1B18";
      g.font = font(76, fonts.serif);
      g.fillText(p.title, 44, 210);
      g.fillStyle = "#3E3A33";
      g.font = font(28, fonts.mono);
      const y2 = wrapText(g, p.text, 44, 290, 900, 46);
      if (p.meta) {
        g.fillStyle = "#6E685C";
        g.font = font(24, fonts.mono);
        g.fillText(p.meta, 44, Math.min(y2 + 70, 560));
      }
    });
    const card = materials.card;
    const c = mesh(new THREE.BoxGeometry(30, 0.3, 18), [
      card,
      card,
      std({ map: face.texture, roughness: 0.85 }),
      card,
      card,
      card,
    ]);
    c.position.set(
      i % 2 ? 0.8 : -0.6,
      0.15 + (items.length - 1 - i) * 0.32,
      (i % 3) * 0.5,
    );
    c.rotation.y = i % 2 ? 0.04 : -0.05;
    kit.tagItem(c, "career", i);
    stack.add(c);
    kit.addPart(
      c,
      (f) =>
        f === "career"
          ? {
              dp: [
                (i - mid) * 3.4,
                (items.length - 1 - i) * 0.6,
                -(i - mid) * 1.4,
              ],
              r: [0, (i - mid) * 0.24, 0],
            }
          : {},
      { key: "career", index: i, face: "y", scale: 1 },
    );
  });

  kit.register("career", stack, 6);
  kit.obstacles.push({
    key: "career",
    kind: "box",
    x: 52,
    z: 24,
    hw: 15.5,
    hd: 10,
  });
}
