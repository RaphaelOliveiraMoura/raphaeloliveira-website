import * as THREE from "three";

import { cycle, formatTemplate } from "@/lib/desk";

import { createCanvasTexture, font, getContext, wrapText } from "../paint";
import { DESK_TEXTURES, type SceneKit } from "../scene-kit";

const PAGE_W = 640;
const PAGE_H = 840;
const RIBBON_COLORS = [0xc9533d, 0x1e6b52, 0x2f5d8a, 0x8a6a1e];
const FLIP_SECONDS = 0.9;

interface PageTexture {
  texture: THREE.CanvasTexture;
  set: (index: number) => void;
}

/** Livro "sobre mim": a capa abre no foco e as fitas trocam o capítulo. */
export function buildBook(kit: SceneKit): void {
  const { fonts, strings, std, mesh, materials } = kit;
  const chapters = kit.content.about;
  const book = new THREE.Group();
  book.position.set(0, 0, 8);
  book.rotation.y = -0.06;

  const pageSide = createCanvasTexture(64, 64);
  const ps = getContext(pageSide);
  ps.fillStyle = "#F2ECDF";
  ps.fillRect(0, 0, 64, 64);
  ps.strokeStyle = "#DDD4C2";
  for (let y = 0; y < 64; y += 4) {
    ps.beginPath();
    ps.moveTo(0, y);
    ps.lineTo(64, y);
    ps.stroke();
  }
  pageSide.needsUpdate = true;
  const pageSideMat = std({ map: pageSide, roughness: 0.95 });
  const coverMat = std({
    map: kit.texture(DESK_TEXTURES.cover),
    roughness: 0.85,
  });
  const dark = materials.dark;
  const paper = materials.paper;

  const pages = mesh(new THREE.BoxGeometry(26, 3.4, 34), [
    pageSideMat,
    dark,
    paper,
    paper,
    pageSideMat,
    pageSideMat,
  ]);
  pages.position.y = 2.2;
  book.add(pages);
  const back = mesh(new THREE.BoxGeometry(27, 0.6, 35), dark);
  back.position.y = 0.3;
  book.add(back);

  const pivot = new THREE.Group();
  pivot.position.set(-13.5, 4.2, 0);
  const cover = mesh(new THREE.BoxGeometry(27, 0.6, 35), [
    dark,
    dark,
    coverMat,
    paper,
    dark,
    dark,
  ]);
  cover.position.x = 13.5;
  pivot.add(cover);
  book.add(pivot);

  const pageLabel = (n: number) => formatTemplate(strings.canvas.page, { n });

  const drawLeft = (
    g: CanvasRenderingContext2D,
    w: number,
    h: number,
    i: number,
  ) => {
    const c = chapters[i] ?? chapters[0];
    if (!c) return;
    g.fillStyle = "#FFFEFA";
    g.fillRect(0, 0, w, h);
    const sh = g.createLinearGradient(w - 70, 0, w, 0);
    sh.addColorStop(0, "rgba(0,0,0,0)");
    sh.addColorStop(1, "rgba(60,40,20,0.10)");
    g.fillStyle = sh;
    g.fillRect(w - 70, 0, 70, h);
    g.fillStyle = "#6E685C";
    g.font = font(22, fonts.mono, "500");
    g.fillText(c.label, 60, 90);
    g.fillStyle = "#1D1B18";
    g.font = font(96, fonts.serif);
    wrapText(g, c.title, 60, 420, 520, 92);
    g.fillStyle = "#6E685C";
    g.font = font(34, fonts.serif, "italic");
    g.fillText(strings.canvas.author, 60, 770);
    g.font = font(22, fonts.mono);
    g.fillText(pageLabel(i * 2 + 2), 60, 812);
  };

  const drawRight = (
    g: CanvasRenderingContext2D,
    w: number,
    h: number,
    i: number,
  ) => {
    const c = chapters[i] ?? chapters[0];
    if (!c) return;
    g.fillStyle = "#FFFEFA";
    g.fillRect(0, 0, w, h);
    const sh = g.createLinearGradient(0, 0, 70, 0);
    sh.addColorStop(0, "rgba(60,40,20,0.10)");
    sh.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = sh;
    g.fillRect(0, 0, 70, h);
    g.strokeStyle = "#ECE7DC";
    g.lineWidth = 2;
    for (let y = 120; y < 800; y += 50) {
      g.beginPath();
      g.moveTo(40, y);
      g.lineTo(600, y);
      g.stroke();
    }
    g.fillStyle = "#1D1B18";
    g.font = font(38, fonts.serif);
    const y2 = wrapText(g, c.text, 60, 112, 520, 50);
    if (c.meta) {
      g.fillStyle = "#6E685C";
      g.font = font(22, fonts.mono);
      wrapText(g, c.meta, 60, y2 + 80, 520, 34);
    }
    g.fillStyle = "#6E685C";
    g.font = font(22, fonts.mono);
    g.textAlign = "right";
    g.fillText(pageLabel(i * 2 + 3), 590, 790);
    g.textAlign = "left";
  };

  const pageTexture = (
    paint: (
      g: CanvasRenderingContext2D,
      w: number,
      h: number,
      i: number,
    ) => void,
  ): PageTexture => {
    const texture = createCanvasTexture(PAGE_W, PAGE_H);
    let current = -1;
    const set = (i: number) => {
      if (i === current) return;
      current = i;
      paint(getContext(texture), PAGE_W, PAGE_H, i);
      texture.needsUpdate = true;
    };
    kit.redraws.push(() => {
      const j = current < 0 ? 0 : current;
      current = -1;
      set(j);
    });
    return { texture, set };
  };

  const leftStatic = pageTexture(drawLeft);
  const rightStatic = pageTexture(drawRight);
  const flipFrontTex = pageTexture(drawRight);
  const flipBackTex = pageTexture(drawLeft);
  // O verso da folha é visto de cabeça para baixo; gira a textura para compensar.
  flipBackTex.texture.center.set(0.5, 0.5);
  flipBackTex.texture.rotation = Math.PI;
  [leftStatic, rightStatic, flipFrontTex, flipBackTex].forEach((p) => p.set(0));

  const pagePlane = () => new THREE.PlaneGeometry(25, 33);
  const leftPage = mesh(
    pagePlane(),
    std({ map: leftStatic.texture, roughness: 0.9 }),
  );
  leftPage.rotation.x = -Math.PI / 2;
  leftPage.position.set(-27, 4.62, 0);
  leftPage.visible = false;
  book.add(leftPage);
  const rightPage = mesh(
    pagePlane(),
    std({ map: rightStatic.texture, roughness: 0.9 }),
  );
  rightPage.rotation.x = -Math.PI / 2;
  rightPage.position.set(0, 3.95, 0);
  book.add(rightPage);

  const flipPivot = new THREE.Group();
  flipPivot.position.set(-13, 4, 0);
  const flipFront = new THREE.Mesh(
    pagePlane(),
    std({ map: flipFrontTex.texture, roughness: 0.9 }),
  );
  flipFront.rotation.x = -Math.PI / 2;
  flipFront.position.set(12.5, 0.03, 0);
  flipFront.castShadow = true;
  flipPivot.add(flipFront);
  const flipBack = new THREE.Mesh(
    pagePlane(),
    std({ map: flipBackTex.texture, roughness: 0.9 }),
  );
  flipBack.rotation.x = Math.PI / 2;
  flipBack.position.set(12.5, -0.03, 0);
  flipPivot.add(flipBack);
  flipPivot.visible = false;
  book.add(flipPivot);

  chapters.forEach((_, i) => {
    const ribbon = mesh(
      new THREE.BoxGeometry(3, 0.15, 8),
      std({ color: cycle(RIBBON_COLORS, i), roughness: 0.6 }),
    );
    ribbon.position.set(-6 + i * 4.4, 4.05, -20);
    kit.tagItem(ribbon, "about", i);
    book.add(ribbon);
    kit.addPart(ribbon, (f, k) => ({
      dp: [0, 0, f === "about" && k === i ? -3 : 0],
    }));
  });

  let shown = -1;
  let flip: { from: number; to: number; dir: 1 | -1; t: number } | null = null;

  kit.register("about", book, 8, ({ dt, focus, item, reduced }) => {
    const a = reduced ? 1 : 1 - Math.exp(-dt * 4.2);
    const open = focus === "about";
    pivot.rotation.z += ((open ? Math.PI : 0) - pivot.rotation.z) * a;
    leftPage.visible = pivot.rotation.z > 3;
    const k = Math.min(item, chapters.length - 1);

    if (open) {
      if (shown < 0) {
        shown = k;
        leftStatic.set(k);
        rightStatic.set(k);
      } else if (k !== shown && !flip) {
        flip = { from: shown, to: k, dir: k > shown ? 1 : -1, t: 0 };
        // A folha que vira carrega o texto: frente = página direita atual,
        // verso = página esquerda do capítulo seguinte (e o inverso ao voltar).
        if (flip.dir > 0) {
          flipFrontTex.set(flip.from);
          flipBackTex.set(flip.to);
          rightStatic.set(flip.to);
        } else {
          flipFrontTex.set(flip.to);
          flipBackTex.set(flip.from);
          leftStatic.set(flip.to);
        }
        shown = k;
      }
    } else {
      shown = -1;
      flip = null;
    }

    if (flip) {
      flip.t = Math.min(1, flip.t + dt / FLIP_SECONDS);
      const t = reduced ? 1 : flip.t;
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const angle = flip.dir > 0 ? ease * Math.PI : (1 - ease) * Math.PI;
      flipPivot.visible = true;
      flipPivot.rotation.z = angle;
      flipPivot.position.y =
        4 + Math.sin(angle) * 2.4 + (angle / Math.PI) * 0.68;
      if (t >= 1) {
        if (flip.dir > 0) leftStatic.set(flip.to);
        else rightStatic.set(flip.to);
        flipPivot.visible = false;
        flip = null;
      }
    } else {
      flipPivot.visible = false;
    }
  });

  kit.obstacles.push({
    key: "about",
    kind: "box",
    x: 0,
    z: 8,
    hw: 13.5,
    hd: 17.5,
  });
}
