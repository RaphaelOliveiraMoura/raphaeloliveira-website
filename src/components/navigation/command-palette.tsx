"use client";

import { useCallback, useState } from "react";

import { useRouter, useTranslations } from "@/lib/i18n";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { useKeyboardShortcut } from "@/hooks";

type CommandLabelKey = "nav.goToDashboard" | "nav.users" | "nav.posts" | "nav.settings";

interface Command {
  id: string;
  labelKey: CommandLabelKey;
  href: string;
  keywords?: string[];
}

const COMMANDS: Command[] = [
  {
    id: "dashboard",
    labelKey: "nav.goToDashboard",
    href: "/dashboard",
    keywords: ["panel", "home"],
  },
  {
    id: "users",
    labelKey: "nav.users",
    href: "/users",
    keywords: ["people"],
  },
  {
    id: "posts",
    labelKey: "nav.posts",
    href: "/posts",
    keywords: ["blog", "content"],
  },
  {
    id: "settings",
    labelKey: "nav.settings",
    href: "/settings",
    keywords: ["config", "preferences"],
  },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations("common");

  useKeyboardShortcut(
    "ctrl+k",
    useCallback((e) => {
      e.preventDefault();
      setOpen((o) => !o);
    }, []),
    true
  );

  useKeyboardShortcut(
    "meta+k",
    useCallback((e) => {
      e.preventDefault();
      setOpen((o) => !o);
    }, []),
    true
  );

  const onSelect = useCallback(
    (cmd: Command) => {
      router.push(cmd.href);
      setOpen(false);
    },
    [router]
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title={t("commandPalette.title")}
      description={t("commandPalette.description")}
    >
      <CommandInput placeholder={t("search.placeholder")} />
      <CommandList>
        <CommandEmpty>{t("search.noResults")}</CommandEmpty>
        <CommandGroup heading={t("nav.navigation")}>
          {COMMANDS.map((cmd) => (
            <CommandItem
              key={cmd.id}
              value={`${t(cmd.labelKey)} ${cmd.keywords?.join(" ") ?? ""}`}
              onSelect={() => onSelect(cmd)}
            >
              {t(cmd.labelKey)}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
