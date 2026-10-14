import { describe, expect, it } from "vitest";

import {
  createTerminal,
  getHireCost,
  runTerminalCommand,
  type TerminalStrings,
  tickBugcap,
} from "@/lib/desk";

const strings: TerminalStrings = {
  welcome: ["welcome"],
  help: ["help line"],
  unknown: "not found: {cmd}",
  whoami: ["raphael"],
  about: ["about"],
  contact: ["contact"],
  projectsTitle: "projects:",
  date: "{time} in BH",
  sudo: "nope",
  exit: "no exit",
  bugcapIntro: ["intro"],
  bugcapHelp: ["fix, hire, quit"],
  bugcapFixed: "fixed, cash {cash}",
  bugcapNoBugs: "no bugs",
  bugcapHired: "interns {interns}",
  bugcapBroke: "costs {cost}",
  bugcapQuit: "fixed {fixed}",
};
const ctx = { time: "14:00", projects: ["match-moment", "bugcap"] };

describe("runTerminalCommand", () => {
  it("ecoa o comando e responde ao help", () => {
    const s = runTerminalCommand(createTerminal(strings), "help", strings, ctx);
    expect(s.lines).toEqual(["welcome", "$ help", "help line"]);
  });

  it("lista os projetos e informa comando desconhecido", () => {
    let s = runTerminalCommand(createTerminal(strings), "ls", strings, ctx);
    expect(s.lines).toContain("  bugcap");
    s = runTerminalCommand(s, "rm -rf /", strings, ctx);
    expect(s.lines.at(-1)).toBe("not found: rm -rf /");
  });

  it("clear limpa a tela", () => {
    const s = runTerminalCommand(
      createTerminal(strings),
      "clear",
      strings,
      ctx,
    );
    expect(s.lines).toEqual([]);
  });
});

describe("bugcap", () => {
  it("corrige bugs, contrata e sai do jogo", () => {
    let s = runTerminalCommand(createTerminal(strings), "bugcap", strings, ctx);
    expect(s.mode).toBe("bugcap");
    const bugs = s.game.bugs;
    s = runTerminalCommand(s, "fix", strings, ctx);
    expect(s.game.bugs).toBe(bugs - 1);
    expect(s.game.cash).toBeGreaterThan(0);

    s = runTerminalCommand(s, "hire", strings, ctx);
    expect(s.lines.at(-1)).toBe(`costs ${getHireCost(0)}`);

    s = { ...s, game: { ...s.game, cash: 500 } };
    s = runTerminalCommand(s, "hire", strings, ctx);
    expect(s.game.interns).toBe(1);

    s = runTerminalCommand(s, "quit", strings, ctx);
    expect(s.mode).toBe("shell");
  });

  it("bugs surgem com o tempo e estagiários corrigem sozinhos", () => {
    let s = runTerminalCommand(createTerminal(strings), "bugcap", strings, ctx);
    const before = s.game.bugs;
    s = tickBugcap(s, 10);
    expect(s.game.bugs).toBeGreaterThan(before);

    s = { ...s, game: { ...s.game, interns: 3 } };
    const fixed = s.game.fixed;
    s = tickBugcap(s, 5);
    expect(s.game.fixed).toBeGreaterThan(fixed);
  });

  it("não avança fora do jogo", () => {
    const s = createTerminal(strings);
    expect(tickBugcap(s, 10)).toBe(s);
  });
});
