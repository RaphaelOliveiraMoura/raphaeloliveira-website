import * as THREE from "three";

import { createBody, cycle, type GoalArea, type PhysicsBody } from "@/lib/desk";

import {
  createCanvasTexture,
  drawCover,
  font,
  getContext,
  wrapText,
} from "../paint";
import { DESK_TEXTURES, type SceneKit } from "../scene-kit";
import { createPencil, PENCIL_COLORS } from "./pencil-cup";

const BALL_RADIUS = 4.5;
const BALL_HOME: [number, number] = [-22, 32];
const TICKET_SPOTS: [number, number, number][] = [
  [-11, -2, 0.2],
  [11, -3, -0.25],
  [-10, 8, -0.15],
  [11, 7, 0.2],
];
const GOAL = { x: -62, zMin: 37, zMax: 53, depth: 9, height: 7 };
const LOOSE_PENCIL = { x: 18, z: 39, yaw: 0.4 };

export interface Playthings {
  bodies: PhysicsBody[];
  goal: GoalArea;
  ball: THREE.Mesh;
  pencil: { outer: THREE.Group; roll: THREE.Group };
  net: THREE.Group;
}

function createBallGeometry(): THREE.SphereGeometry {
  const geometry = new THREE.SphereGeometry(BALL_RADIUS, 64, 48);
  const phi = (1 + Math.sqrt(5)) / 2;
  const icosahedron = [
    [0, 1, phi],
    [0, -1, phi],
    [0, 1, -phi],
    [0, -1, -phi],
    [1, phi, 0],
    [-1, phi, 0],
    [1, -phi, 0],
    [-1, -phi, 0],
    [phi, 0, 1],
    [-phi, 0, 1],
    [phi, 0, -1],
    [-phi, 0, -1],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z).normalize());
  const colors: number[] = [];
  const n = new THREE.Vector3();
  const pos = geometry.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    n.set(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize();
    let best = -1;
    icosahedron.forEach((v) => {
      best = Math.max(best, v.dot(n));
    });
    const c: [number, number, number] =
      best > 0.925
        ? [0.11, 0.105, 0.095]
        : best > 0.905
          ? [0.55, 0.52, 0.48]
          : [0.93, 0.91, 0.87];
    colors.push(c[0], c[1], c[2]);
  }
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  return geometry;
}

function createNetTexture(): THREE.CanvasTexture {
  const texture = createCanvasTexture(128, 128);
  const g = getContext(texture);
  g.clearRect(0, 0, 128, 128);
  g.strokeStyle = "rgba(250,248,240,0.9)";
  g.lineWidth = 3;
  for (let i = 0; i <= 128; i += 16) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i, 128);
    g.stroke();
    g.beginPath();
    g.moveTo(0, i);
    g.lineTo(128, i);
    g.stroke();
  }
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

function buildGoal(kit: SceneKit): THREE.Group {
  const { std, mesh } = kit;
  const white = std({ color: 0xf7f5ef, roughness: 0.5 });
  const goal = new THREE.Group();
  goal.position.set(GOAL.x, 0, (GOAL.zMin + GOAL.zMax) / 2);
  const width = GOAL.zMax - GOAL.zMin;
  const bar = (len: number) => new THREE.CylinderGeometry(0.35, 0.35, len, 12);

  [-width / 2, width / 2].forEach((z) => {
    const post = mesh(bar(GOAL.height), white);
    post.position.set(0, GOAL.height / 2, z);
    goal.add(post);
    const top = mesh(bar(GOAL.depth), white);
    top.rotation.z = Math.PI / 2;
    top.position.set(-GOAL.depth / 2, GOAL.height, z);
    goal.add(top);
    const backPost = mesh(bar(GOAL.height), white);
    backPost.position.set(-GOAL.depth, GOAL.height / 2, z);
    goal.add(backPost);
  });
  const crossbar = mesh(bar(width), white);
  crossbar.rotation.x = Math.PI / 2;
  crossbar.position.set(0, GOAL.height, 0);
  goal.add(crossbar);

  const netTex = createNetTexture();
  const netMat = (rx: number, ry: number) => {
    const t = netTex.clone();
    t.repeat.set(rx, ry);
    t.needsUpdate = true;
    return std({
      map: t,
      transparent: true,
      alphaTest: 0.3,
      side: THREE.DoubleSide,
      roughness: 1,
    });
  };
  const net = new THREE.Group();
  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(width, GOAL.height),
    netMat(width / 2, GOAL.height / 2),
  );
  back.rotation.y = Math.PI / 2;
  back.position.set(-GOAL.depth, GOAL.height / 2, 0);
  net.add(back);
  const roof = new THREE.Mesh(
    new THREE.PlaneGeometry(GOAL.depth, width),
    netMat(GOAL.depth / 2, width / 2),
  );
  roof.rotation.x = -Math.PI / 2;
  roof.position.set(-GOAL.depth / 2, GOAL.height, 0);
  net.add(roof);
  [-width / 2, width / 2].forEach((z) => {
    const side = new THREE.Mesh(
      new THREE.PlaneGeometry(GOAL.depth, GOAL.height),
      netMat(GOAL.depth / 2, GOAL.height / 2),
    );
    side.position.set(-GOAL.depth / 2, GOAL.height / 2, z);
    net.add(side);
  });
  net.traverse((o) => {
    o.castShadow = true;
  });
  goal.add(net);
  goal.userData.net = net;

  const turf = new THREE.Mesh(
    new THREE.PlaneGeometry(21, 22),
    std({ map: kit.texture(DESK_TEXTURES.grass, [1, 1]), roughness: 1 }),
  );
  turf.rotation.x = -Math.PI / 2;
  turf.position.set(-2, 0.04, 0);
  turf.receiveShadow = true;
  goal.add(turf);
  kit.scene.add(goal);

  const cz = (GOAL.zMin + GOAL.zMax) / 2;
  kit.obstacles.push(
    { key: "goal", kind: "circle", x: GOAL.x, z: GOAL.zMin, r: 0.5 },
    { key: "goal", kind: "circle", x: GOAL.x, z: GOAL.zMax, r: 0.5 },
    {
      key: "net",
      kind: "box",
      x: GOAL.x - GOAL.depth / 2,
      z: GOAL.zMin,
      hw: GOAL.depth / 2,
      hd: 0.3,
    },
    {
      key: "net",
      kind: "box",
      x: GOAL.x - GOAL.depth / 2,
      z: GOAL.zMax,
      hw: GOAL.depth / 2,
      hd: 0.3,
    },
    {
      key: "net",
      kind: "box",
      x: GOAL.x - GOAL.depth,
      z: cz,
      hw: 0.3,
      hd: width / 2,
    },
  );
  return net;
}

/** Ingressos (a seção "fora do código"), a bola, o mini gol e um lápis solto. */
export function buildFootball(kit: SceneKit): Playthings {
  const { fonts, strings, std, mesh, materials } = kit;
  const tickets = kit.content.football;
  const group = new THREE.Group();
  group.position.set(BALL_HOME[0], 0, BALL_HOME[1]);

  tickets.forEach((p, i) => {
    const [x, z, ry] = cycle(TICKET_SPOTS, i);
    const face = kit.painter(900, 460, (g, w, h, img) => {
      g.fillStyle = "#FBF6E9";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#A8402C";
      g.fillRect(0, 0, 130, h);
      g.save();
      g.translate(65, h / 2);
      g.rotate(-Math.PI / 2);
      g.fillStyle = "#FBF6E9";
      g.font = font(30, fonts.mono, "500");
      g.textAlign = "center";
      g.fillText(strings.canvas.ticket, 0, 10);
      g.restore();
      g.setLineDash([10, 10]);
      g.strokeStyle = "#C9B99A";
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(150, 0);
      g.lineTo(150, h);
      g.stroke();
      g.setLineDash([]);
      g.fillStyle = "#8A3B2B";
      g.font = font(22, fonts.mono, "500");
      g.fillText(p.label, 190, 70);
      g.fillStyle = "#1D1B18";
      g.font = font(64, fonts.serif);
      g.fillText(p.title, 190, 160);
      g.fillStyle = "#3E3A33";
      g.font = font(26, fonts.mono);
      wrapText(g, p.text, 190, 230, img ? 400 : 660, 40);
      if (img) {
        g.translate(w - 150, 280);
        g.rotate(0.04);
        g.fillStyle = "#FFFFFF";
        g.fillRect(-122, -92, 244, 184);
        drawCover(g, img, -112, -82, 224, 164);
      }
    });
    if (p.image) face.setImage(p.image);
    const card = materials.card;
    const t = mesh(new THREE.BoxGeometry(9, 0.15, 4.6), [
      card,
      card,
      std({ map: face.texture, roughness: 0.85 }),
      card,
      card,
      card,
    ]);
    t.position.set(x, 0.08, z);
    t.rotation.y = ry;
    kit.tagItem(t, "football", i);
    group.add(t);
    kit.addPart(t, null, { key: "football", index: i, face: "y", scale: 2.4 });
  });
  kit.register("football", group, 12);

  const ball = mesh(
    createBallGeometry(),
    std({ vertexColors: true, roughness: 0.5 }),
  );
  ball.position.set(BALL_HOME[0], BALL_RADIUS, BALL_HOME[1]);
  ball.userData.key = "football";
  ball.userData.body = "ball";
  kit.scene.add(ball);
  kit.hits.push(ball);

  const outer = new THREE.Group();
  outer.position.set(LOOSE_PENCIL.x, 0.48, LOOSE_PENCIL.z);
  outer.rotation.y = LOOSE_PENCIL.yaw;
  const roll = new THREE.Group();
  outer.add(roll);
  const pencil = createPencil(kit, cycle(PENCIL_COLORS, 4));
  pencil.rotation.z = -Math.PI / 2;
  pencil.position.x = -8.5;
  roll.add(pencil);
  outer.traverse((o) => {
    o.userData.key = "tools";
    o.userData.body = "pencil";
    if ((o as THREE.Mesh).isMesh) kit.hits.push(o);
  });
  kit.scene.add(outer);

  const net = buildGoal(kit);

  return {
    bodies: [
      createBody({
        id: "ball",
        x: BALL_HOME[0],
        z: BALL_HOME[1],
        radius: BALL_RADIUS,
        friction: 0.75,
      }),
      createBody({
        id: "pencil",
        x: LOOSE_PENCIL.x,
        z: LOOSE_PENCIL.z,
        radius: 1.4,
        mass: 0.3,
        friction: 2.4,
        restitution: 0.4,
        rollAxis: LOOSE_PENCIL.yaw,
      }),
    ],
    goal: { x: GOAL.x, zMin: GOAL.zMin, zMax: GOAL.zMax },
    ball,
    pencil: { outer, roll },
    net,
  };
}
