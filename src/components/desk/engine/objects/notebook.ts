import * as THREE from "three";

import {
  type ActivityEvent,
  createActivityEvent,
  createActivityHistory,
  createRandom,
  createTerminal,
  DESK_TIME_ZONE,
  formatTemplate,
  getElapsedMinutes,
  getHireCost,
  nextActivityDelay,
  runTerminalCommand,
  type TerminalState,
  tickBugcap,
} from "@/lib/desk";

import { createCanvasTexture, font, getContext } from "../paint";
import type { DeskEngineStrings, SceneKit } from "../scene-kit";

const SCREEN_W = 1024;
const SCREEN_H = 640;
const BAR_H = 56;
const KIND_COLORS = {
  commit: "#6CA6FF",
  deploy: "#5BD38A",
  build: "#E8B04B",
  pr: "#B58CF0",
  test: "#5BD3C7",
} as const;
const FAIL_COLOR = "#F06A5B";

export interface NotebookControls {
  setDraft: (text: string) => void;
  submit: (text: string) => void;
}

function describe(
  event: ActivityEvent,
  s: DeskEngineStrings["notebook"],
): string {
  switch (event.kind) {
    case "commit":
      return event.message;
    case "deploy":
      return event.ok
        ? formatTemplate(s.deployOk, { s: event.durationSec })
        : s.deployFail;
    case "build":
      return event.ok
        ? formatTemplate(s.buildOk, { s: event.durationSec })
        : s.buildFail;
    case "pr":
      return `${formatTemplate(s.prMerged, { n: event.count })} · ${event.message}`;
    case "test":
      return event.ok
        ? formatTemplate(s.testOk, { n: event.count, s: event.durationSec })
        : formatTemplate(s.testFail, { n: event.count });
  }
}

function relativeTime(
  at: number,
  now: number,
  s: DeskEngineStrings["notebook"],
): string {
  const minutes = getElapsedMinutes(at, now);
  if (minutes < 1) return s.now;
  if (minutes < 60) return formatTemplate(s.minutesAgo, { n: minutes });
  return formatTemplate(s.hoursAgo, { n: Math.floor(minutes / 60) });
}

function fitText(
  g: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string {
  if (g.measureText(text).width <= maxWidth) return text;
  let out = text;
  while (out.length > 1 && g.measureText(`${out}…`).width > maxWidth)
    out = out.slice(0, -1);
  return `${out}…`;
}

/** Notebook aberto: painel de atividade (simulada) e um terminal de brinquedo. */
export function buildNotebook(kit: SceneKit): NotebookControls {
  const { fonts, strings, std, mesh } = kit;
  const s = strings.notebook;
  const clock = new Intl.DateTimeFormat(strings.locale, {
    timeZone: DESK_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  });
  const projects = kit.content.projects.map((p) => p.id);

  const now = Date.now();
  const rng = createRandom(Math.floor(now / 3_600_000));
  let events = createActivityHistory(Math.floor(now / 3_600_000), now);
  let nextId = events.length + 1;
  let nextAt = now + nextActivityDelay(rng);

  let terminal: TerminalState = createTerminal(strings.terminal);
  let draft = "";
  let mode: "activity" | "terminal" = "activity";
  let dirty = true;
  let sinceDraw = 0;
  let bugcapClock = 0;

  const screen = createCanvasTexture(SCREEN_W, SCREEN_H);

  const drawBar = (g: CanvasRenderingContext2D, title: string) => {
    g.fillStyle = "#202328";
    g.fillRect(0, 0, SCREEN_W, BAR_H);
    ["#F06A5B", "#E8B04B", "#5BD38A"].forEach((c, i) => {
      g.fillStyle = c;
      g.beginPath();
      g.arc(34 + i * 30, BAR_H / 2, 9, 0, Math.PI * 2);
      g.fill();
    });
    g.fillStyle = "#C9CCD2";
    g.font = font(24, fonts.mono, "500");
    g.textAlign = "center";
    g.fillText(title, SCREEN_W / 2, BAR_H / 2 + 8);
    g.textAlign = "left";
  };

  const drawActivity = (g: CanvasRenderingContext2D, t: number) => {
    drawBar(g, `${s.title} — ${s.simulated}`);
    const rowH = 62;
    events.slice(0, 8).forEach((e, i) => {
      const y = BAR_H + 22 + i * rowH;
      const color = e.ok ? KIND_COLORS[e.kind] : FAIL_COLOR;
      g.fillStyle =
        i === 0 && t - e.at < 2500 ? "rgba(108,166,255,0.10)" : "transparent";
      g.fillRect(16, y - 6, SCREEN_W - 32, rowH - 6);
      g.fillStyle = color;
      g.beginPath();
      g.arc(40, y + 24, 8, 0, Math.PI * 2);
      g.fill();
      g.font = font(20, fonts.mono, "500");
      g.fillStyle = color;
      g.fillText(s.kinds[e.kind].toUpperCase(), 64, y + 31);
      g.fillStyle = "#F2F3F5";
      g.font = font(24, fonts.mono, "500");
      g.fillText(e.repo, 180, y + 31);
      g.fillStyle = "#9AA0A8";
      g.font = font(21, fonts.mono);
      const repoW = Math.max(200, g.measureText(e.repo).width + 40);
      g.fillText(
        fitText(g, describe(e, s), SCREEN_W - 180 - repoW - 170),
        180 + repoW,
        y + 31,
      );
      g.textAlign = "right";
      g.fillStyle = "#7B818A";
      g.fillText(relativeTime(e.at, t, s), SCREEN_W - 34, y + 31);
      g.textAlign = "left";
    });
    g.fillStyle = "#2A2E35";
    g.fillRect(0, SCREEN_H - 50, SCREEN_W, 50);
    g.fillStyle = "#5BD38A";
    g.beginPath();
    g.arc(32, SCREEN_H - 25, 7, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#C9CCD2";
    g.font = font(20, fonts.mono);
    g.fillText(
      formatTemplate(s.status, { time: clock.format(t) }),
      50,
      SCREEN_H - 18,
    );
    g.textAlign = "right";
    g.fillStyle = "#7B818A";
    g.fillText(s.hint, SCREEN_W - 30, SCREEN_H - 18);
    g.textAlign = "left";
  };

  const drawTerminal = (g: CanvasRenderingContext2D, t: number) => {
    drawBar(g, s.terminalTitle);
    const lineH = 32;
    const bottom = terminal.mode === "bugcap" ? SCREEN_H - 60 : SCREEN_H - 20;
    const capacity = Math.floor((bottom - BAR_H - 24) / lineH);
    const prompt = `$ ${draft}`;
    const lines = [...terminal.lines.slice(-(capacity - 1)), prompt];
    g.font = font(23, fonts.mono);
    lines.forEach((line, i) => {
      g.fillStyle = line.startsWith("$ ") ? "#8FD3A8" : "#E6E8EB";
      g.fillText(fitText(g, line, SCREEN_W - 60), 30, BAR_H + 44 + i * lineH);
    });
    if (Math.floor(t / 530) % 2 === 0) {
      const x = 30 + g.measureText(prompt).width + 4;
      g.fillStyle = "#E6E8EB";
      g.fillRect(x, BAR_H + 44 + (lines.length - 1) * lineH - 22, 13, 26);
    }
    if (terminal.mode === "bugcap") {
      const game = terminal.game;
      g.fillStyle = "#3A2E12";
      g.fillRect(0, SCREEN_H - 52, SCREEN_W, 52);
      g.fillStyle = "#F2C14E";
      g.font = font(22, fonts.mono, "500");
      g.fillText(
        formatTemplate(s.bugcapStatus, {
          bugs: game.bugs,
          cash: game.cash,
          interns: game.interns,
          cost: getHireCost(game.interns),
        }),
        30,
        SCREEN_H - 18,
      );
    }
  };

  const draw = () => {
    const g = getContext(screen);
    const t = Date.now();
    g.fillStyle = "#15171A";
    g.fillRect(0, 0, SCREEN_W, SCREEN_H);
    if (mode === "activity") drawActivity(g, t);
    else drawTerminal(g, t);
    screen.needsUpdate = true;
    dirty = false;
    sinceDraw = 0;
  };
  kit.redraws.push(draw);
  draw();

  // ---------- modelo ----------
  const laptop = new THREE.Group();
  laptop.position.set(0, 0, -42);
  const aluminum = std({ color: 0xc8cbd0, metalness: 0.55, roughness: 0.38 });
  const bezel = std({ color: 0x111214, roughness: 0.4 });
  const base = mesh(new THREE.BoxGeometry(28, 1.1, 19), aluminum);
  base.position.y = 0.55;
  laptop.add(base);

  const keysTex = createCanvasTexture(512, 192);
  const kg = getContext(keysTex);
  kg.fillStyle = "#2B2D31";
  kg.fillRect(0, 0, 512, 192);
  kg.fillStyle = "#17181B";
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 14; col++) {
      kg.fillRect(8 + col * 35.5, 8 + row * 36, 30, 30);
    }
  }
  keysTex.needsUpdate = true;
  const keyboard = new THREE.Mesh(
    new THREE.PlaneGeometry(25, 9.4),
    std({ map: keysTex, roughness: 0.7 }),
  );
  keyboard.rotation.x = -Math.PI / 2;
  keyboard.position.set(0, 1.12, -3);
  keyboard.receiveShadow = true;
  laptop.add(keyboard);
  const trackpad = new THREE.Mesh(
    new THREE.PlaneGeometry(8.5, 5),
    std({ color: 0xb3b6bc, roughness: 0.3, metalness: 0.4 }),
  );
  trackpad.rotation.x = -Math.PI / 2;
  trackpad.position.set(0, 1.12, 5.6);
  laptop.add(trackpad);

  const hinge = new THREE.Group();
  hinge.position.set(0, 1.1, -9.3);
  hinge.rotation.x = -0.3;
  const lid = mesh(new THREE.BoxGeometry(28, 18.5, 0.55), [
    aluminum,
    aluminum,
    aluminum,
    aluminum,
    bezel,
    aluminum,
  ]);
  lid.position.y = 9.25;
  hinge.add(lid);
  const display = new THREE.Mesh(
    new THREE.PlaneGeometry(26, 16.25),
    new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: 0xffffff,
      emissiveMap: screen,
      emissiveIntensity: 1,
      roughness: 0.25,
    }),
  );
  display.position.set(0, 9.5, 0.29);
  hinge.add(display);
  laptop.add(hinge);

  kit.tagItem(display, "notebook", 1);
  kit.tagItem(keyboard, "notebook", 0);

  kit.register("notebook", laptop, 22, ({ dt, focus, item }) => {
    const nextMode =
      focus === "notebook" && item === 1 ? "terminal" : "activity";
    if (nextMode !== mode) {
      mode = nextMode;
      dirty = true;
    }
    const t = Date.now();
    if (t >= nextAt) {
      events = [createActivityEvent(rng, nextId++, t), ...events].slice(0, 12);
      nextAt = t + nextActivityDelay(rng);
      dirty = true;
    }
    if (terminal.mode === "bugcap") {
      bugcapClock += dt;
      if (bugcapClock >= 0.25) {
        terminal = tickBugcap(terminal, bugcapClock);
        bugcapClock = 0;
        dirty = true;
      }
    }
    sinceDraw += dt;
    if (dirty || sinceDraw > (mode === "terminal" ? 0.26 : 1)) draw();
  });
  kit.obstacles.push({
    key: "notebook",
    kind: "box",
    x: 0,
    z: -42,
    hw: 14.5,
    hd: 10,
  });

  return {
    setDraft: (text) => {
      draft = text;
      dirty = true;
    },
    submit: (text) => {
      terminal = runTerminalCommand(terminal, text, strings.terminal, {
        time: clock.format(Date.now()),
        projects,
      });
      draft = "";
      dirty = true;
    },
  };
}
