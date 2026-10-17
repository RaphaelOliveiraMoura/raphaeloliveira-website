"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

import { ChevronUp } from "lucide-react";

import { LanguageSwitcher } from "@/components/shared";

import type { Daylight, ViewMode, ViewPreset, ViewStation } from "@/lib/desk";
import { toast } from "@/lib/feedback";
import { useLocale, useMessages, useTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  useEventListener,
  useLocalStorage,
  useMediaQuery,
  useReducedMotion,
  useSessionStorage,
} from "@/hooks";

import { DeskAudio } from "./desk-audio";
import {
  DESK_SECTIONS,
  type DeskContent,
  type DeskSectionKey,
} from "./desk-content";
import { deskSerif } from "./desk-fonts";
import type {
  DeskEngine,
  DeskEngineCallbacks,
  DeskViewState,
} from "./engine/desk-engine";
import type { DeskEngineStrings } from "./engine/scene-kit";

const DeskScene = dynamic(() => import("./desk-scene"), { ssr: false });

const VIEW_MODES: readonly ViewMode[] = ["orbit", "seat", "tour"];
const PRESET_KEYS: Partial<Record<string, ViewPreset>> = {
  "1": "home",
  "2": "top",
  "3": "side",
  "4": "window",
  "5": "close",
};
const STATIONS: readonly ViewStation[] = [
  "home",
  "top",
  "side",
  "window",
  "close",
  "seat",
];

export interface DeskHomeProps {
  content: DeskContent;
  /** Versão em texto (SSR): acessível e indexável, visível no modo lista. */
  children: ReactNode;
}

const chip =
  "min-h-9 shrink-0 rounded-full border border-[#1D1B18] px-3 text-xs whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9533D]";

export function DeskHome({ content, children }: DeskHomeProps) {
  const t = useTranslations("desk");
  const locale = useLocale();
  const messages = useMessages().desk;
  const reducedMotion = useReducedMotion();
  const coarse = useMediaQuery("(pointer: coarse)");

  const [engine, setEngine] = useState<DeskEngine | null>(null);
  const [focus, setFocus] = useState<DeskSectionKey | null>(null);
  const [item, setItem] = useState(0);
  const [introDone, setIntroDone] = useState(false);
  const [failed, setFailed] = useState(false);
  const [listMode, setListMode] = useState(false);
  const [daylight, setDaylight] = useState<Daylight | null>(null);
  const [clock, setClock] = useState("");
  const [lampOn, setLampOn] = useState(false);
  const [view, setView] = useState<DeskViewState | null>(null);
  const [draft, setDraft] = useState("");
  const [soundOn, setSoundOn] = useLocalStorage("desk:sound", false);
  const [introSeen, setIntroSeen] = useSessionStorage("desk:intro-seen", false);
  const [goals, setGoals] = useLocalStorage("desk:goals", 0);

  const audioRef = useRef<DeskAudio | null>(null);
  const tagEls = useRef(new Map<DeskSectionKey, HTMLElement>());
  const wayEls = useRef(new Map<ViewStation, HTMLElement>());
  const floatEl = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<HTMLInputElement>(null);

  const strings: DeskEngineStrings = {
    locale,
    canvas: messages.canvas,
    notebook: messages.notebook,
    terminal: messages.terminal,
  };

  const items = focus ? content[focus] : [];
  const current = items[item];
  const terminalOpen = focus === "notebook" && item === 1;
  const night = daylight?.phase === "night";

  const getAudio = () => {
    audioRef.current ??= new DeskAudio();
    return audioRef.current;
  };

  const callbacks: DeskEngineCallbacks = {
    onFocusChange: (nextFocus, nextItem) => {
      setFocus(nextFocus);
      setItem(nextItem);
    },
    onIntroEnd: () => {
      setIntroDone(true);
      setIntroSeen(true);
    },
    onGoal: () => {
      const count = goals + 1;
      setGoals(count);
      toast.success(t("goal", { count }));
    },
    onSound: (sound, volume) => audioRef.current?.play(sound, volume),
    onDaylight: (d) => {
      setDaylight(d);
      const hours = Math.floor(d.hour);
      const minutes = Math.round((d.hour - hours) * 60);
      setClock(
        `${String(hours).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`,
      );
    },
    onLampChange: setLampOn,
    onViewChange: setView,
  };

  const handleEngine = (next: DeskEngine | null) => {
    setEngine(next);
    if (!next) return;
    tagEls.current.forEach((el, key) => next.setTagElement(key, el));
    wayEls.current.forEach((el, station) =>
      next.setWaypointElement(station, el),
    );
    next.setFloatElement(floatEl.current);
  };

  const toggleSound = () => {
    const audio = getAudio();
    if (soundOn) audio.disable();
    else audio.enable();
    setSoundOn(!soundOn);
  };

  // O navegador só libera áudio depois de um gesto: religa o som salvo no primeiro toque.
  useEventListener("pointerdown", () => {
    if (soundOn) getAudio().enable();
  });

  useEventListener("keydown", (event) => {
    if (!engine || listMode) return;
    const typing = event.target instanceof HTMLInputElement;
    if (event.key === "Escape") {
      if (focus) engine.setFocus(null);
      else if (view?.mode === "seat") engine.setViewMode("orbit");
      return;
    }
    if (typing) return;
    if (focus && event.key === "ArrowRight") engine.stepItem(1);
    if (focus && event.key === "ArrowLeft") engine.stepItem(-1);
    if (view?.mode === "tour") {
      if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        engine.tourStep(1);
      }
      if (["ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault();
        engine.tourStep(-1);
      }
    }
    const preset = PRESET_KEYS[event.key];
    if (preset) engine.setPreset(preset);
  });

  useEffect(() => {
    if (terminalOpen) terminalRef.current?.focus();
  }, [terminalOpen]);

  useEffect(() => () => audioRef.current?.dispose(), []);

  const goTo = (key: DeskSectionKey) => engine?.setFocus(key);
  const showList = listMode || failed;
  const counter = t("counter", {
    current: String(item + 1).padStart(2, "0"),
    total: String(items.length).padStart(2, "0"),
  });
  const external = current?.href.startsWith("http");

  return (
    <div
      data-night={night}
      className="group relative h-dvh min-h-[560px] overflow-hidden bg-[#E4DDD0] font-mono text-[#1D1B18]"
      onPointerUp={() => {
        if (terminalOpen) terminalRef.current?.focus();
      }}
    >
      {!failed && (
        <DeskScene
          key={locale}
          content={content}
          strings={strings}
          label={t("canvasLabel")}
          reducedMotion={reducedMotion}
          playIntro={!introSeen}
          initialMode={coarse ? "tour" : "orbit"}
          callbacks={callbacks}
          onEngine={handleEngine}
          onError={() => setFailed(true)}
        />
      )}

      {!engine && !failed && (
        <p className="absolute inset-0 flex items-center justify-center text-sm tracking-wide">
          {t("loading")}
        </p>
      )}

      {DESK_SECTIONS.map((key, i) => (
        <button
          key={key}
          type="button"
          aria-label={messages.sections[key].label}
          ref={(el) => {
            if (el) tagEls.current.set(key, el);
            else tagEls.current.delete(key);
            engine?.setTagElement(key, el);
          }}
          tabIndex={focus ? -1 : 0}
          onClick={() => goTo(key)}
          className="group/tag pointer-events-none absolute top-0 left-0 grid size-11 place-items-center opacity-0 transition-opacity duration-300 focus-visible:outline-none"
        >
          <span
            aria-hidden="true"
            className="relative block size-3 rounded-full bg-[#FFFEFA] shadow-[0_0_0_2px_rgba(29,27,24,0.55),0_2px_6px_rgba(40,30,10,0.35)] transition-colors group-focus-visible/tag:bg-[#C9533D] group-data-[near=true]/tag:bg-[#C9533D]"
          >
            <span
              className="absolute inset-0 rounded-full bg-[#FFFEFA] group-data-[near=true]/tag:hidden motion-safe:animate-[desk-beacon_4.5s_ease-out_infinite]"
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          </span>
          <span className="pointer-events-none absolute bottom-full left-1/2 mb-0.5 -translate-x-1/2 translate-y-1 rounded-sm bg-[#FFFEFA] px-3 py-1.5 text-[13px] tracking-wide whitespace-nowrap text-[#1D1B18] opacity-0 shadow-[0_2px_6px_rgba(40,30,10,0.18)] transition-[opacity,translate] duration-200 group-focus-visible/tag:translate-y-0 group-focus-visible/tag:opacity-100 group-focus-visible/tag:outline-2 group-focus-visible/tag:outline-[#C9533D] group-data-[near=true]/tag:pointer-events-auto group-data-[near=true]/tag:translate-y-0 group-data-[near=true]/tag:opacity-100">
            {messages.sections[key].label} ↗
          </span>
        </button>
      ))}

      <nav aria-label={t("view.stationsLabel")}>
        {STATIONS.map((station) => (
          <button
            key={station}
            type="button"
            ref={(el) => {
              if (el) wayEls.current.set(station, el);
              else wayEls.current.delete(station);
              engine?.setWaypointElement(station, el);
            }}
            tabIndex={-1}
            onClick={() => engine?.goToStation(station)}
            className="group/way pointer-events-none absolute top-0 left-0 flex flex-col items-center gap-1.5 opacity-0 transition-opacity duration-500 focus-visible:outline-none"
          >
            <span
              aria-hidden="true"
              className="grid size-12 rotate-[var(--arrow-angle)] place-items-center rounded-full border border-[rgba(255,254,250,0.85)] bg-[rgba(29,27,24,0.42)] text-[#FFFEFA] shadow-[0_6px_16px_-6px_rgba(0,0,0,0.6)] backdrop-blur-sm transition-[scale,background-color] duration-200 group-hover/way:scale-110 group-hover/way:bg-[rgba(29,27,24,0.7)] group-focus-visible/way:outline-2 group-focus-visible/way:outline-[#C9533D]"
            >
              <ChevronUp className="size-6" />
            </span>
            <span className="rounded-full bg-[rgba(29,27,24,0.72)] px-2.5 py-1 text-[11px] whitespace-nowrap text-[#FFFEFA] opacity-0 transition-opacity group-hover/way:opacity-100 group-focus-visible/way:opacity-100">
              {t(`view.stations.${station}`)}
            </span>
          </button>
        ))}
      </nav>

      <header
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-[13px] tracking-wide transition-opacity duration-500 sm:px-10",
          focus && "opacity-0",
        )}
      >
        <p className="pointer-events-auto flex items-baseline gap-2.5 text-[#1D1B18] group-data-[night=true]:text-[#EDE7DC]">
          <span
            className={cn(
              deskSerif.className,
              "text-3xl italic tracking-normal",
            )}
          >
            {messages.canvas.seal}
          </span>
          {t("brand")}
        </p>
        <nav
          aria-label={t("shortcuts")}
          className="pointer-events-auto hidden flex-wrap gap-x-3.5 gap-y-1 lg:flex"
        >
          {DESK_SECTIONS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => goTo(key)}
              className="min-h-10 text-[13px] text-[#1D1B18] underline-offset-4 hover:underline group-data-[night=true]:text-[#EDE7DC]"
            >
              {messages.sections[key].label}
            </button>
          ))}
        </nav>
      </header>

      <div className="absolute right-4 bottom-4 left-4 flex flex-wrap items-end justify-between gap-2 sm:right-10 sm:left-10">
        <div className="flex w-full flex-col gap-2 md:w-auto">
          <p
            className={cn(
              "pointer-events-none text-[10px] tracking-[0.12em] text-[#5E584D] transition-opacity duration-500 md:text-xs group-data-[night=true]:text-[#B9B1A3]",
              focus && view?.mode !== "tour" && "opacity-0",
            )}
          >
            {t(`hints.${view?.mode ?? "orbit"}${coarse ? "Touch" : ""}`)}
          </p>
          {view && (
            <div className="flex max-w-full items-center gap-2 overflow-x-auto pb-1">
              <div
                role="group"
                aria-label={t("view.label")}
                className="flex shrink-0 rounded-full border border-[#1D1B18] bg-[#FFFEFA] p-0.5"
              >
                {VIEW_MODES.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={view.mode === mode}
                    onClick={() => engine?.setViewMode(mode)}
                    className={cn(
                      "min-h-8 rounded-full px-3 text-xs whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-[#C9533D]",
                      view.mode === mode && "bg-[#1D1B18] text-[#F4F2ED]",
                    )}
                  >
                    {t(`view.${mode}`)}
                  </button>
                ))}
              </div>
              {view.mode === "orbit" && (
                <button
                  type="button"
                  aria-label={t("view.cyclePreset")}
                  title={t("view.cyclePreset")}
                  onClick={() => engine?.cyclePreset()}
                  className={cn(chip, "bg-[#FFFEFA]")}
                >
                  {t("view.preset", {
                    name: t(`view.presets.${view.preset ?? "home"}`),
                  })}{" "}
                  ↻
                </button>
              )}
              {view.mode === "tour" && (
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label={t("view.tourPrev")}
                    onClick={() => engine?.tourStep(-1)}
                    className="size-9 rounded-full border border-[#1D1B18] bg-[#FFFEFA]"
                  >
                    ↑
                  </button>
                  <span className="rounded-full bg-[rgba(255,254,250,0.9)] px-3 py-2 text-[11px] tracking-[0.08em]">
                    {view.tourIndex < 0
                      ? t("view.tourOverview")
                      : t("view.tourProgress", {
                          current: view.tourIndex + 1,
                          total: view.tourTotal,
                        })}
                  </span>
                  <button
                    type="button"
                    aria-label={t("view.tourNext")}
                    onClick={() => engine?.tourStep(1)}
                    className="size-9 rounded-full border border-[#1D1B18] bg-[#FFFEFA]"
                  >
                    ↓
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="ml-auto flex max-w-full items-center gap-2 overflow-x-auto pb-1">
          {daylight && (
            <span className="hidden shrink-0 rounded-full bg-[rgba(255,254,250,0.85)] px-3 py-2 text-[11px] tracking-[0.08em] sm:inline">
              {t("clock", {
                time: clock,
                phase: t(`phases.${daylight.phase}`),
              })}
            </span>
          )}
          <button
            type="button"
            aria-pressed={lampOn}
            aria-label={t("controls.lamp")}
            onClick={() => engine?.toggleLamp()}
            className={cn(
              chip,
              lampOn ? "bg-[#1D1B18] text-[#F4F2ED]" : "bg-[#FFFEFA]",
            )}
          >
            {lampOn ? t("controls.lampOn") : t("controls.lampOff")}
          </button>
          <button
            type="button"
            aria-pressed={soundOn}
            aria-label={t("controls.sound")}
            onClick={toggleSound}
            className={cn(
              chip,
              soundOn ? "bg-[#1D1B18] text-[#F4F2ED]" : "bg-[#FFFEFA]",
            )}
          >
            {soundOn ? t("controls.soundOn") : t("controls.soundOff")}
          </button>
          <button
            type="button"
            aria-pressed={showList}
            onClick={() => setListMode(!listMode)}
            disabled={failed}
            className={cn(chip, "bg-[#FFFEFA]")}
          >
            {t("controls.listView")}
          </button>
          <div className="shrink-0 rounded-full bg-[#FFFEFA]">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {engine && !introDone && (
        <button
          type="button"
          onClick={() => engine.skipIntro()}
          className={cn(
            chip,
            "absolute top-20 right-4 bg-[#FFFEFA] sm:right-10",
          )}
        >
          {t("skipIntro")}
        </button>
      )}

      {focus && (
        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-center justify-between gap-2.5 px-4 py-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-3 sm:px-10">
          <button
            type="button"
            onClick={() => engine?.setFocus(null)}
            className={cn(
              chip,
              "pointer-events-auto min-h-11 bg-[#FFFEFA] px-4",
            )}
          >
            {t("back")}
          </button>
          <p className="hidden rounded-full bg-[rgba(255,254,250,0.85)] px-3.5 py-2 text-[11px] tracking-[0.14em] text-[#4A453C] md:block">
            {messages.sections[focus].hint}
          </p>
          <nav
            aria-label={t("shortcuts")}
            className="pointer-events-auto flex max-w-full gap-1 overflow-x-auto pb-1"
          >
            {DESK_SECTIONS.map((key) => (
              <button
                key={key}
                type="button"
                aria-current={key === focus ? "true" : undefined}
                onClick={() => goTo(key)}
                className={cn(
                  chip,
                  "min-h-8 px-2.5 text-[11px]",
                  key === focus
                    ? "bg-[#1D1B18] text-[#F4F2ED]"
                    : "bg-[#FFFEFA]",
                )}
              >
                {messages.sections[key].label}
              </button>
            ))}
          </nav>
        </div>
      )}

      <div
        ref={(el) => {
          floatEl.current = el;
          engine?.setFloatElement(el);
        }}
        className="pointer-events-none absolute left-0 top-0 flex items-center gap-2 opacity-0 transition-opacity duration-300"
      >
        <button
          type="button"
          aria-label={t("prev")}
          onClick={() => engine?.stepItem(-1)}
          className="size-11 rounded-full border border-[#1D1B18] bg-[#FFFEFA] text-base"
        >
          ←
        </button>
        {current?.href && current.cta && (
          <a
            href={current.href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="flex min-h-11 items-center rounded-full bg-[#1D1B18] px-4 text-xs tracking-wide whitespace-nowrap text-[#F4F2ED] shadow-[0_10px_18px_-10px_rgba(0,0,0,0.6)]"
          >
            {current.cta}
          </a>
        )}
        <span className="flex min-h-11 items-center rounded-full bg-[rgba(255,254,250,0.9)] px-3 text-[11px] tracking-[0.08em]">
          {terminalOpen ? messages.content.notebook.terminal.text : counter}
        </span>
        <button
          type="button"
          aria-label={t("next")}
          onClick={() => engine?.stepItem(1)}
          className="size-11 rounded-full border border-[#1D1B18] bg-[#FFFEFA] text-base"
        >
          →
        </button>
      </div>

      {terminalOpen && (
        <input
          ref={terminalRef}
          value={draft}
          aria-label={t("controls.terminalInput")}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          onChange={(e) => {
            setDraft(e.target.value);
            engine?.terminalDraft(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            engine?.terminalSubmit(draft);
            setDraft("");
          }}
          className="sr-only"
        />
      )}

      <p aria-live="polite" className="sr-only">
        {focus && current
          ? `${messages.sections[focus].label}: ${current.title} (${counter})`
          : ""}
      </p>

      <div
        className={cn(
          showList
            ? "absolute inset-0 overflow-y-auto bg-[#F4F1EA]"
            : "sr-only focus-within:not-sr-only focus-within:absolute focus-within:inset-0 focus-within:overflow-y-auto focus-within:bg-[#F4F1EA]",
        )}
      >
        {failed && (
          <p className="mx-auto max-w-3xl px-4 pt-8 text-sm text-[#8A3B2B] sm:px-10">
            {t("webglError")}
          </p>
        )}
        {listMode && !failed && (
          <button
            type="button"
            onClick={() => setListMode(false)}
            className={cn(
              chip,
              "fixed top-4 right-4 z-10 bg-[#FFFEFA] sm:right-10",
            )}
          >
            {t("controls.deskView")}
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
