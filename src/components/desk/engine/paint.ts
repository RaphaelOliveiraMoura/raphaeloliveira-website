import * as THREE from "three";

export interface DeskFonts {
  serif: string;
  mono: string;
  hand: string;
}

export type PaintFn = (
  g: CanvasRenderingContext2D,
  w: number,
  h: number,
  image: HTMLImageElement | null,
) => void;

export interface Painter {
  texture: THREE.CanvasTexture;
  redraw: () => void;
  setImage: (src: string) => void;
}

export const PALETTE = {
  paper: "#FFFEFA",
  ink: "#1D1B18",
  muted: "#6E685C",
  body: "#3E3A33",
  red: "#C9533D",
  rule: "#DCE4EE",
} as const;

export function createCanvasTexture(w: number, h: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export function getContext(
  texture: THREE.CanvasTexture,
): CanvasRenderingContext2D {
  const ctx = (texture.image as HTMLCanvasElement).getContext("2d");
  if (!ctx) throw new Error("Canvas 2D indisponível");
  return ctx;
}

export function createPainter(w: number, h: number, paint: PaintFn): Painter {
  const texture = createCanvasTexture(w, h);
  let image: HTMLImageElement | null = null;
  const redraw = () => {
    const g = getContext(texture);
    g.save();
    paint(g, w, h, image);
    g.restore();
    texture.needsUpdate = true;
  };
  redraw();
  return {
    texture,
    redraw,
    setImage: (src) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        image = img;
        redraw();
      };
      img.src = src;
    },
  };
}

/** Escreve texto quebrando por largura. Devolve o y da última linha. */
export function wrapText(
  g: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = String(text).split(" ");
  let line = "";
  let cy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (g.measureText(test).width > maxWidth && line) {
      g.fillText(line, x, cy);
      cy += lineHeight;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) g.fillText(line, x, cy);
  return cy;
}

export function ruledBackground(
  g: CanvasRenderingContext2D,
  w: number,
  h: number,
  top: number,
  step: number,
  marginColor: string = PALETTE.red,
): void {
  g.fillStyle = PALETTE.paper;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = PALETTE.rule;
  g.lineWidth = 2;
  for (let y = top + step; y < h; y += step) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(w, y);
    g.stroke();
  }
  g.strokeStyle = marginColor;
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(0, top);
  g.lineTo(w, top);
  g.stroke();
}

export function drawCover(
  g: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale;
  const sh = h / scale;
  g.drawImage(img, (img.width - sw) / 2, 0, sw, sh, x, y, w, h);
}

export function font(size: number, family: string, prefix = ""): string {
  return `${prefix ? `${prefix} ` : ""}${size}px ${family}`;
}
