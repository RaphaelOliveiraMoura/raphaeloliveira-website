import * as THREE from "three";

import { createRandom, cycle, type Daylight, type DayPhase } from "@/lib/desk";

import { createCanvasTexture, font, getContext } from "./paint";
import { DESK_TEXTURES, type SceneKit } from "./scene-kit";

/** Medidas do quarto (1 unidade ≈ 1 cm; o tampo da mesa fica em y = 0). */
export const ROOM = {
  floorY: -76,
  wallTop: 240,
  backZ: -96,
  sideX: 150,
  frontZ: 220,
  window: { y: 55, z: -15, width: 84, height: 64 },
} as const;

const SKY: Record<DayPhase, [string, string]> = {
  morning: ["#9cc3e6", "#f3e2c8"],
  afternoon: ["#7fb2e0", "#e3eef6"],
  evening: ["#4e5f8f", "#f2a46b"],
  night: ["#0b1328", "#26324f"],
};
const HAZE: Record<DayPhase, string> = {
  morning: "#7f8f92",
  afternoon: "#74868c",
  evening: "#5a4a58",
  night: "#0f141d",
};
const BOOK_COLORS = [
  "#C9533D",
  "#2F5D8A",
  "#1E6B52",
  "#B38A2E",
  "#3E3A33",
  "#8A3B2B",
  "#E7DCC6",
  "#4D7AA8",
];

export interface Room {
  applyDaylight: (daylight: Daylight) => void;
}

/** Vista da janela: céu da hora, Serra do Curral e prédios de BH. */
function paintWindowView(texture: THREE.CanvasTexture, d: Daylight): void {
  const g = getContext(texture);
  const { width: w, height: h } = texture.image as HTMLCanvasElement;
  const night = d.phase === "night";
  const [top, bottom] = SKY[d.phase];
  const sky = g.createLinearGradient(0, 0, 0, h * 0.75);
  sky.addColorStop(0, top);
  sky.addColorStop(1, bottom);
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);

  const rng = createRandom(7);
  if (night) {
    g.fillStyle = "rgba(255,255,255,0.8)";
    for (let i = 0; i < 70; i++) {
      g.fillRect(
        rng() * w,
        rng() * h * 0.5,
        1.5 + rng() * 1.5,
        1.5 + rng() * 1.5,
      );
    }
  }

  // Sol (ou lua) cruzando o quadro ao longo do dia.
  const progress = night ? 0.7 : Math.min(1, Math.max(0, (d.hour - 6) / 13));
  const cx = w * (0.15 + 0.7 * progress);
  const cy = h * (0.55 - Math.sin(progress * Math.PI) * 0.4);
  const glow = g.createRadialGradient(cx, cy, 0, cx, cy, night ? 60 : 140);
  glow.addColorStop(
    0,
    night ? "rgba(235,238,255,0.9)" : "rgba(255,246,220,0.95)",
  );
  glow.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, w, h);
  g.fillStyle = night ? "#E9ECF5" : "#FFF6DC";
  g.beginPath();
  g.arc(cx, cy, night ? 18 : 26, 0, Math.PI * 2);
  g.fill();

  // Serra do Curral: crista serrilhada ao fundo.
  g.fillStyle = HAZE[d.phase];
  g.beginPath();
  g.moveTo(0, h);
  for (let x = 0; x <= w; x += 32) {
    const ridge =
      h * (0.5 + Math.sin(x * 0.006) * 0.04 + Math.sin(x * 0.021) * 0.02) +
      rng() * 10;
    g.lineTo(x, ridge);
  }
  g.lineTo(w, h);
  g.fill();

  // Prédios em duas camadas, com janelas acesas à noite.
  [0.62, 0.72].forEach((base, layer) => {
    let x = -10;
    while (x < w) {
      const bw = 40 + rng() * 70;
      const bh = h * (0.12 + rng() * (layer ? 0.3 : 0.2));
      const y = h * base + h * 0.3 - bh;
      g.fillStyle = night
        ? layer
          ? "#151a24"
          : "#1b2130"
        : layer
          ? "#8d8f8c"
          : "#a7aaa6";
      g.fillRect(x, y, bw, h - y);
      for (let wy = y + 10; wy < h - 10; wy += 18) {
        for (let wx = x + 8; wx < x + bw - 8; wx += 14) {
          const lit = rng() < (night ? 0.32 : 0.08);
          g.fillStyle = lit
            ? night
              ? "rgba(255,214,140,0.9)"
              : "rgba(255,255,255,0.35)"
            : "rgba(0,0,0,0.12)";
          g.fillRect(wx, wy, 6, 9);
        }
      }
      x += bw + 4 + rng() * 10;
    }
  });
  texture.needsUpdate = true;
}

function paintPoster(
  texture: THREE.CanvasTexture,
  kind: "stripes" | "print",
  serif: string,
  mono: string,
): void {
  const g = getContext(texture);
  const { width: w, height: h } = texture.image as HTMLCanvasElement;
  if (kind === "stripes") {
    // Listras grená e azul, sem escudo nem marca.
    const stripes = 7;
    for (let i = 0; i < stripes; i++) {
      g.fillStyle = i % 2 ? "#004D98" : "#A50044";
      g.fillRect((i * w) / stripes, 0, w / stripes + 1, h);
    }
    g.fillStyle = "#EDBB00";
    g.fillRect(0, h * 0.86, w, h * 0.14);
    g.fillStyle = "#1D1B18";
    g.font = font(30, mono, "500");
    g.textAlign = "center";
    g.fillText("1899", w / 2, h * 0.95);
    return;
  }
  g.fillStyle = "#F4EFE4";
  g.fillRect(0, 0, w, h);
  g.strokeStyle = "#C9533D";
  g.lineWidth = 3;
  for (let i = 0; i < 9; i++) {
    g.beginPath();
    g.arc(w / 2, h * 0.42, 40 + i * 26, Math.PI * 0.1, Math.PI * 0.9, true);
    g.stroke();
  }
  g.fillStyle = "#1D1B18";
  g.font = font(150, serif, "italic");
  g.textAlign = "center";
  g.fillText("ro", w / 2, h * 0.5);
  g.font = font(24, mono, "500");
  g.fillText("BELO HORIZONTE", w / 2, h * 0.86);
}

function buildWalls(kit: SceneKit, group: THREE.Group): void {
  const { std } = kit;
  const plaster = std({ color: 0xe9e2d6, roughness: 0.95 });
  const height = ROOM.wallTop - ROOM.floorY;
  const midY = (ROOM.wallTop + ROOM.floorY) / 2;
  const depth = ROOM.frontZ - ROOM.backZ;
  const midZ = (ROOM.frontZ + ROOM.backZ) / 2;

  const plane = (
    w: number,
    h: number,
    x: number,
    y: number,
    z: number,
    ry: number,
  ) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), plaster);
    m.position.set(x, y, z);
    m.rotation.y = ry;
    m.receiveShadow = true;
    group.add(m);
  };

  plane(ROOM.sideX * 2, height, 0, midY, ROOM.backZ, 0);
  plane(depth, height, ROOM.sideX, midY, midZ, -Math.PI / 2);

  // Parede da esquerda montada em volta da janela.
  const win = ROOM.window;
  const sill = win.y - win.height / 2;
  const lintel = win.y + win.height / 2;
  const back = win.z - win.width / 2;
  const front = win.z + win.width / 2;
  const x = -ROOM.sideX;
  plane(
    depth,
    sill - ROOM.floorY,
    x,
    (sill + ROOM.floorY) / 2,
    midZ,
    Math.PI / 2,
  );
  plane(
    depth,
    ROOM.wallTop - lintel,
    x,
    (ROOM.wallTop + lintel) / 2,
    midZ,
    Math.PI / 2,
  );
  plane(
    back - ROOM.backZ,
    win.height,
    x,
    win.y,
    (back + ROOM.backZ) / 2,
    Math.PI / 2,
  );
  plane(
    ROOM.frontZ - front,
    win.height,
    x,
    win.y,
    (front + ROOM.frontZ) / 2,
    Math.PI / 2,
  );

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.sideX * 2, depth),
    std({
      map: kit.texture(DESK_TEXTURES.oak, [5, 4]),
      color: 0x9c8a74,
      roughness: 0.8,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, ROOM.floorY, midZ);
  floor.receiveShadow = true;
  group.add(floor);
}

function buildWindow(kit: SceneKit, group: THREE.Group): THREE.CanvasTexture {
  const win = ROOM.window;
  const view = createCanvasTexture(1024, 768);
  const outside = new THREE.Mesh(
    new THREE.PlaneGeometry(win.width * 1.9, win.height * 1.9),
    new THREE.MeshBasicMaterial({ map: view }),
  );
  outside.position.set(-ROOM.sideX - 40, win.y + 8, win.z);
  outside.rotation.y = Math.PI / 2;
  group.add(outside);

  const wood = kit.std({ color: 0xf2ede3, roughness: 0.7 });
  const bar = (w: number, h: number, d: number, y: number, z: number) => {
    const m = kit.mesh(new THREE.BoxGeometry(d, h, w), wood);
    m.position.set(-ROOM.sideX + d / 2 - 1, y, z);
    group.add(m);
  };
  const t = 3;
  bar(win.width + t * 2, t, 4, win.y + win.height / 2 + t / 2, win.z);
  bar(win.width + t * 2, t, 4, win.y - win.height / 2 - t / 2, win.z);
  bar(t, win.height, 4, win.y, win.z - win.width / 2 - t / 2);
  bar(t, win.height, 4, win.y, win.z + win.width / 2 + t / 2);
  bar(win.width, 1.6, 2.5, win.y, win.z);
  bar(1.6, win.height, 2.5, win.y, win.z);
  const sill = kit.mesh(new THREE.BoxGeometry(12, 2, win.width + 14), wood);
  sill.position.set(-ROOM.sideX + 5, win.y - win.height / 2 - 4, win.z);
  group.add(sill);
  return view;
}

function buildShelf(kit: SceneKit, group: THREE.Group): void {
  const { std, mesh, materials } = kit;
  const z = ROOM.backZ + 6;
  const board = mesh(new THREE.BoxGeometry(84, 2.4, 11), materials.oak);
  board.position.set(-6, 74, z);
  group.add(board);
  const rng = createRandom(3);
  let x = -44;
  for (let i = 0; i < 11; i++) {
    const w = 2.6 + rng() * 2.4;
    const h = 13 + rng() * 9;
    const book = mesh(
      new THREE.BoxGeometry(w, h, 8 + rng() * 2),
      std({ color: new THREE.Color(cycle(BOOK_COLORS, i)), roughness: 0.8 }),
    );
    book.position.set(x + w / 2, 75.2 + h / 2, z);
    book.rotation.z = i === 9 ? 0.32 : 0;
    group.add(book);
    x += w + 0.4 + (i === 8 ? 3 : 0);
  }
  const pot = mesh(
    new THREE.CylinderGeometry(4, 3.2, 7, 24),
    std({ color: 0xc9533d, roughness: 0.7 }),
  );
  pot.position.set(26, 78.7, z);
  group.add(pot);
  const leaf = std({ color: 0x3c6e47, roughness: 0.8 });
  for (let i = 0; i < 7; i++) {
    const l = mesh(new THREE.SphereGeometry(2.6, 12, 8), leaf);
    l.scale.set(0.7, 1.6, 0.5);
    const a = (i / 7) * Math.PI * 2;
    l.position.set(26 + Math.cos(a) * 3, 85 + rng() * 3, z + Math.sin(a) * 2);
    l.rotation.z = Math.cos(a) * 0.6;
    group.add(l);
  }
}

function buildPosters(kit: SceneKit, group: THREE.Group): void {
  const frame = kit.std({ color: 0x1d1b18, roughness: 0.6 });
  (
    [
      ["stripes", -78],
      ["print", 66],
    ] as const
  ).forEach(([kind, x]) => {
    const texture = createCanvasTexture(512, 680);
    paintPoster(texture, kind, kit.fonts.serif, kit.fonts.mono);
    kit.redraws.push(() =>
      paintPoster(texture, kind, kit.fonts.serif, kit.fonts.mono),
    );
    const box = kit.mesh(new THREE.BoxGeometry(34, 44, 1.6), frame);
    box.position.set(x, 112, ROOM.backZ + 1);
    group.add(box);
    const art = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 40),
      kit.std({ map: texture, roughness: 0.9 }),
    );
    art.position.set(x, 112, ROOM.backZ + 1.85);
    group.add(art);
  });
}

function buildFurniture(kit: SceneKit, group: THREE.Group): void {
  const { std, mesh, materials } = kit;
  // Pernas da mesa: agora que existe chão, a mesa precisa se apoiar nele.
  const legH = -ROOM.floorY - 4;
  [
    [-82, -50],
    [82, -50],
    [-82, 50],
    [82, 50],
  ].forEach(([x, z]) => {
    const leg = mesh(new THREE.BoxGeometry(5, legH, 5), materials.oak);
    leg.position.set(x ?? 0, -4 - legH / 2, z ?? 0);
    group.add(leg);
  });

  const fabric = std({ color: 0x2f3437, roughness: 0.9 });
  const metal = std({ color: 0x1d1b18, metalness: 0.5, roughness: 0.4 });
  const chair = new THREE.Group();
  chair.position.set(34, 0, 112);
  chair.rotation.y = -0.4;
  const seat = mesh(new THREE.BoxGeometry(44, 5, 42), fabric);
  seat.position.y = -30;
  chair.add(seat);
  const backrest = mesh(new THREE.BoxGeometry(44, 38, 5), fabric);
  backrest.position.set(0, -8, 20);
  backrest.rotation.x = -0.12;
  chair.add(backrest);
  [
    [-19, -18],
    [19, -18],
    [-19, 18],
    [19, 18],
  ].forEach(([x, z]) => {
    const leg = mesh(new THREE.CylinderGeometry(1.1, 1.1, 44, 10), metal);
    leg.position.set(x ?? 0, -54, z ?? 0);
    chair.add(leg);
  });
  group.add(chair);

  const rugTex = createCanvasTexture(512, 384);
  const rg = getContext(rugTex);
  rg.fillStyle = "#D8CDB8";
  rg.fillRect(0, 0, 512, 384);
  rg.strokeStyle = "#B9A98D";
  rg.lineWidth = 10;
  rg.strokeRect(24, 24, 464, 336);
  rg.lineWidth = 3;
  rg.strokeRect(46, 46, 420, 292);
  rugTex.needsUpdate = true;
  const rug = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 160),
    std({ map: rugTex, roughness: 1 }),
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, ROOM.floorY + 0.3, 40);
  rug.receiveShadow = true;
  group.add(rug);

  const pot = mesh(
    new THREE.CylinderGeometry(11, 8.5, 26, 28),
    std({ color: 0xe7dcc6, roughness: 0.6 }),
  );
  pot.position.set(118, ROOM.floorY + 13, -72);
  group.add(pot);
  const leaf = std({ color: 0x2f5e3c, roughness: 0.8 });
  const rng = createRandom(11);
  for (let i = 0; i < 14; i++) {
    const l = mesh(new THREE.SphereGeometry(6, 12, 8), leaf);
    l.scale.set(0.45, 2.4, 0.9);
    const a = rng() * Math.PI * 2;
    const r = 3 + rng() * 6;
    l.position.set(
      118 + Math.cos(a) * r,
      ROOM.floorY + 40 + rng() * 30,
      -72 + Math.sin(a) * r,
    );
    l.rotation.set(Math.sin(a) * 0.5, a, Math.cos(a) * 0.5);
    group.add(l);
  }
}

/**
 * O quarto em volta da mesa. Nada aqui é clicável: o clique atravessa e,
 * como na mesa vazia, volta para a visão geral.
 */
export function buildRoom(kit: SceneKit): Room {
  const group = new THREE.Group();
  buildWalls(kit, group);
  const view = buildWindow(kit, group);
  buildShelf(kit, group);
  buildPosters(kit, group);
  buildFurniture(kit, group);
  // Paredes e móveis não projetam sombra: a parede da janela taparia o sol.
  group.traverse((o) => {
    o.castShadow = false;
  });
  kit.scene.add(group);
  return {
    applyDaylight: (d) => paintWindowView(view, d),
  };
}
