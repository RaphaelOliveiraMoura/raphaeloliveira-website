import { formatTemplate } from "./random";

/**
 * Terminal de brincadeira do notebook (easter egg), com uma versão
 * de bolso do Bug Capitalist. Lógica pura: cada comando devolve um novo estado.
 */

export interface TerminalStrings {
  welcome: string[];
  help: string[];
  unknown: string;
  whoami: string[];
  about: string[];
  contact: string[];
  projectsTitle: string;
  date: string;
  sudo: string;
  exit: string;
  bugcapIntro: string[];
  bugcapHelp: string[];
  bugcapFixed: string;
  bugcapNoBugs: string;
  bugcapHired: string;
  bugcapBroke: string;
  bugcapQuit: string;
}

export interface BugcapGame {
  bugs: number;
  cash: number;
  interns: number;
  fixed: number;
  spawn: number;
  autoFix: number;
}

export interface TerminalState {
  lines: string[];
  mode: "shell" | "bugcap";
  game: BugcapGame;
}

export interface TerminalContext {
  time: string;
  projects: string[];
}

export const TERMINAL_MAX_LINES = 60;
export const BUGCAP_MAX_BUGS = 99;
export const BUGCAP_FIX_REWARD = 12;
export const BUGCAP_INTERN_REWARD = 8;

const EMPTY_GAME: BugcapGame = {
  bugs: 3,
  cash: 0,
  interns: 0,
  fixed: 0,
  spawn: 0,
  autoFix: 0,
};

export function getHireCost(interns: number): number {
  return 40 * (interns + 1);
}

export function createTerminal(strings: TerminalStrings): TerminalState {
  return { lines: [...strings.welcome], mode: "shell", game: EMPTY_GAME };
}

function append(state: TerminalState, lines: string[]): TerminalState {
  return {
    ...state,
    lines: [...state.lines, ...lines].slice(-TERMINAL_MAX_LINES),
  };
}

function runBugcap(
  state: TerminalState,
  command: string,
  strings: TerminalStrings,
): TerminalState {
  const game = state.game;
  switch (command) {
    case "":
    case "fix": {
      if (game.bugs < 1) return append(state, [strings.bugcapNoBugs]);
      const next = {
        ...game,
        bugs: game.bugs - 1,
        cash: game.cash + BUGCAP_FIX_REWARD,
        fixed: game.fixed + 1,
      };
      return append({ ...state, game: next }, [
        formatTemplate(strings.bugcapFixed, { cash: next.cash }),
      ]);
    }
    case "hire": {
      const cost = getHireCost(game.interns);
      if (game.cash < cost) {
        return append(state, [formatTemplate(strings.bugcapBroke, { cost })]);
      }
      const next = {
        ...game,
        cash: game.cash - cost,
        interns: game.interns + 1,
      };
      return append({ ...state, game: next }, [
        formatTemplate(strings.bugcapHired, { interns: next.interns }),
      ]);
    }
    case "help":
      return append(state, strings.bugcapHelp);
    case "quit":
    case "exit":
      return append({ ...state, mode: "shell" }, [
        formatTemplate(strings.bugcapQuit, { fixed: game.fixed }),
      ]);
    case "clear":
      return { ...state, lines: [] };
    default:
      return append(state, [formatTemplate(strings.unknown, { cmd: command })]);
  }
}

export function runTerminalCommand(
  state: TerminalState,
  rawInput: string,
  strings: TerminalStrings,
  context: TerminalContext,
): TerminalState {
  const input = rawInput.trim();
  const echoed = append(state, [`$ ${input}`]);
  const command = input.toLowerCase();

  if (state.mode === "bugcap") return runBugcap(echoed, command, strings);

  const [name, ...args] = command.split(/\s+/);
  switch (name) {
    case "":
      return echoed;
    case "help":
      return append(echoed, strings.help);
    case "whoami":
      return append(echoed, strings.whoami);
    case "about":
      return append(echoed, strings.about);
    case "contact":
      return append(echoed, strings.contact);
    case "ls":
    case "projects":
      return append(echoed, [
        strings.projectsTitle,
        ...context.projects.map((p) => `  ${p}`),
      ]);
    case "date":
      return append(echoed, [
        formatTemplate(strings.date, { time: context.time }),
      ]);
    case "echo":
      return append(echoed, [rawInput.trim().slice(5)]);
    case "sudo":
      return append(echoed, [strings.sudo]);
    case "clear":
      return { ...echoed, lines: [] };
    case "exit":
      return append(echoed, [strings.exit]);
    case "bugcap":
      return append(
        { ...echoed, mode: "bugcap", game: { ...EMPTY_GAME } },
        strings.bugcapIntro,
      );
    default:
      return append(echoed, [
        formatTemplate(strings.unknown, { cmd: [name, ...args].join(" ") }),
      ]);
  }
}

/** Avança o jogo: bugs surgem sozinhos e estagiários corrigem por conta própria. */
export function tickBugcap(state: TerminalState, dt: number): TerminalState {
  if (state.mode !== "bugcap") return state;
  const game = { ...state.game };
  game.spawn += dt * 0.7;
  const spawned = Math.floor(game.spawn);
  game.spawn -= spawned;
  game.bugs = Math.min(BUGCAP_MAX_BUGS, game.bugs + spawned);

  game.autoFix += dt * 0.45 * game.interns;
  const autoFixed = Math.min(game.bugs, Math.floor(game.autoFix));
  game.autoFix -= Math.floor(game.autoFix);
  game.bugs -= autoFixed;
  game.fixed += autoFixed;
  game.cash += autoFixed * BUGCAP_INTERN_REWARD;

  return { ...state, game };
}
