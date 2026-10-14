import * as THREE from "three";

import { cycle, formatTemplate } from "@/lib/desk";

import { font, wrapText } from "../paint";
import type { SceneKit } from "../scene-kit";

export const PENCIL_COLORS = [
  "#2F74C0",
  "#23252A",
  "#7A7D82",
  "#3C873A",
  "#C21E2E",
  "#4D7AA8",
  "#D8741F",
  "#2348C9",
];

const PENCIL_LENGTH = 15;

/** Lápis sextavado em pé (eixo Y), com a ponta para cima. */
export function createPencil(kit: SceneKit, color: string): THREE.Group {
  const { std, mesh } = kit;
  const wood = std({ color: 0xe2c191, roughness: 0.8 });
  const lead = std({ color: 0x2a2a2a, roughness: 0.5 });
  const group = new THREE.Group();
  const body = mesh(
    new THREE.CylinderGeometry(0.48, 0.48, PENCIL_LENGTH, 6),
    std({ color: new THREE.Color(color), roughness: 0.55 }),
  );
  body.position.y = PENCIL_LENGTH / 2;
  group.add(body);
  const tip = mesh(new THREE.ConeGeometry(0.48, 1.8, 6), wood);
  tip.position.y = PENCIL_LENGTH + 0.9;
  group.add(tip);
  const graphite = mesh(new THREE.ConeGeometry(0.17, 0.6, 6), lead);
  graphite.position.y = PENCIL_LENGTH + 1.95;
  group.add(graphite);
  return group;
}

/** Porta-lápis: cada lápis é uma ferramenta; ao escolher, ele sobe e mostra a ficha. */
export function buildPencilCup(kit: SceneKit): void {
  const { fonts, strings, std, mesh, materials } = kit;
  const tools = kit.content.tools;
  const cup = new THREE.Group();
  cup.position.set(-24, 0, -32);

  const slate = std({
    color: 0x323c44,
    roughness: 0.85,
    side: THREE.DoubleSide,
  });
  const body = mesh(
    new THREE.CylinderGeometry(4.6, 4.4, 10, 48, 1, true),
    slate,
  );
  body.position.y = 5;
  cup.add(body);
  const bottom = mesh(new THREE.CircleGeometry(4.4, 40), slate);
  bottom.rotation.x = -Math.PI / 2;
  bottom.position.y = 0.6;
  cup.add(bottom);
  const rim = mesh(new THREE.TorusGeometry(4.6, 0.18, 8, 48), slate);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 10;
  cup.add(rim);

  tools.forEach((p, i) => {
    const color = cycle(PENCIL_COLORS, i);
    const angle = (i / tools.length) * Math.PI * 2;
    const pencil = createPencil(kit, color);
    pencil.position.set(Math.cos(angle) * 2.3, 0.6, Math.sin(angle) * 2.3);
    pencil.rotation.set(Math.sin(angle) * 0.16, 0, -Math.cos(angle) * 0.16);
    kit.tagItem(pencil, "tools", i);
    cup.add(pencil);
    kit.addPart(pencil, (f, k) =>
      f === "tools" && k === i ? { dp: [0, 9, 0], r: [0, 0, 0] } : {},
    );

    const flag = kit.painter(900, 520, (g, w, h) => {
      g.fillStyle = "#FFFEFA";
      g.fillRect(0, 0, w, h);
      g.fillStyle = color;
      g.fillRect(0, 0, 26, h);
      g.fillStyle = "#6E685C";
      g.font = font(24, fonts.mono, "500");
      g.fillText(
        formatTemplate(strings.canvas.tool, {
          n: String(i + 1).padStart(2, "0"),
          total: String(tools.length).padStart(2, "0"),
        }),
        70,
        70,
      );
      g.fillStyle = "#1D1B18";
      g.font = font(100, fonts.serif);
      g.fillText(p.title, 70, 210);
      g.fillStyle = "#3E3A33";
      g.font = font(30, fonts.mono);
      wrapText(g, p.text, 70, 300, 780, 46);
    });
    const card = materials.card;
    const flagMesh = mesh(new THREE.BoxGeometry(18, 10.4, 0.15), [
      card,
      card,
      card,
      card,
      std({ map: flag.texture, roughness: 0.85 }),
      card,
    ]);
    flagMesh.position.set(0, 12, 0);
    flagMesh.scale.setScalar(0.001);
    kit.tagItem(flagMesh, "tools", i);
    cup.add(flagMesh);
    kit.addPart(flagMesh, () => ({ s: 0.001 }), {
      key: "tools",
      index: i,
      face: "z",
      scale: 1.4,
    });
  });

  kit.register("tools", cup, 20);
  kit.obstacles.push({ key: "tools", kind: "circle", x: -24, z: -32, r: 4.8 });
}
