import * as THREE from "three";

import { font, wrapText } from "../paint";
import type { SceneKit } from "../scene-kit";

/** Porta-cartas: um envelope por canal de contato. */
export function buildLetterRack(kit: SceneKit): void {
  const { fonts, strings, std, mesh, materials } = kit;
  const letters = kit.content.contact;
  const rack = new THREE.Group();
  rack.position.set(-56, 0, 24);
  rack.rotation.y = 0.12;

  const base = mesh(new THREE.BoxGeometry(26, 2, 13), materials.oak);
  base.position.y = 1;
  rack.add(base);
  const lip = mesh(new THREE.BoxGeometry(26, 4, 1), materials.oak);
  lip.position.set(0, 3, 6);
  rack.add(lip);

  const envelope = std({ color: 0xf3ede1, roughness: 0.9 });
  letters.forEach((p, i) => {
    const face = kit.painter(1100, 650, (g, w, h) => {
      g.fillStyle = "#F3EDE1";
      g.fillRect(0, 0, w, h);
      g.strokeStyle = "#D9CFBC";
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(w / 2, 300);
      g.lineTo(w, 0);
      g.stroke();
      g.fillStyle = "#6E685C";
      g.font = font(24, fonts.mono, "500");
      g.fillText(p.label, 60, 380);
      g.fillStyle = "#1D1B18";
      g.font = font(70, fonts.serif);
      g.fillText(p.title, 60, 460);
      g.fillStyle = "#3E3A33";
      g.font = font(32, fonts.mono);
      const y = wrapText(g, p.text, 60, 530, 980, 44);
      if (p.meta) {
        g.fillStyle = "#6E685C";
        g.font = font(24, fonts.mono);
        g.fillText(p.meta, 60, Math.min(y + 50, h - 30));
      }
      g.fillStyle = "#9A3322";
      g.beginPath();
      g.arc(w / 2, 300, 44, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#F3E3D8";
      g.font = font(40, fonts.serif, "italic");
      g.textAlign = "center";
      g.fillText(strings.canvas.seal, w / 2, 312);
    });
    const group = new THREE.Group();
    const env = mesh(new THREE.BoxGeometry(22, 13, 0.25), [
      envelope,
      envelope,
      envelope,
      envelope,
      std({ map: face.texture, roughness: 0.9 }),
      envelope,
    ]);
    env.position.y = 6.5;
    group.add(env);
    group.position.set(0, 2, -4.5 + i * 3);
    group.rotation.x = -0.18;
    kit.tagItem(group, "contact", i);
    rack.add(group);
    kit.addPart(group, null, {
      key: "contact",
      index: i,
      face: "z",
      scale: 1.6,
    });
  });

  kit.register("contact", rack, 18);
  kit.obstacles.push({
    key: "contact",
    kind: "box",
    x: -56,
    z: 24,
    hw: 13.5,
    hd: 7,
  });
}
