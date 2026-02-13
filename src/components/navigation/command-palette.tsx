"use client";

import { useCallback, useState } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { useRouter, useTranslations } from "@/lib/i18n";
import { useKeyboardShortcut } from "@/hooks";

type CommandLabelKey =
  | "nav.goToDashboard"
  | "nav.goToData"
  | "nav.goToForms"
  | "nav.goToSettings"
  | "nav.goToExamples"
  | "nav.goToFeedback"
  | "nav.goToUploads"
  | "nav.goToSearch"
  | "nav.goToRoles"
  | "nav.goToAudit"
  | "nav.goToFeatureFlags"
  | "nav.goToWebhooks"
  | "nav.goToApiKeys"
  | "nav.goToNotifications"
  | "nav.goToSessions";

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
    id: "data",
    labelKey: "nav.goToData",
    href: "/dashboard/data",
    keywords: ["table", "list", "export", "users"],
  },
  {
    id: "feedback",
    labelKey: "nav.goToFeedback",
    href: "/dashboard/feedback",
    keywords: ["bug", "feature", "request", "vote"],
  },
  {
    id: "uploads",
    labelKey: "nav.goToUploads",
    href: "/dashboard/uploads",
    keywords: ["files", "images", "documents"],
  },
  {
    id: "search",
    labelKey: "nav.goToSearch",
    href: "/dashboard/search",
    keywords: ["find", "query"],
  },
  {
    id: "forms",
    labelKey: "nav.goToForms",
    href: "/dashboard/forms",
    keywords: ["input", "validation", "upload"],
  },
  {
    id: "roles",
    labelKey: "nav.goToRoles",
    href: "/dashboard/roles",
    keywords: ["permissions", "access", "rbac"],
  },
  {
    id: "audit",
    labelKey: "nav.goToAudit",
    href: "/dashboard/audit",
    keywords: ["logs", "activity", "tracking"],
  },
  {
    id: "featureFlags",
    labelKey: "nav.goToFeatureFlags",
    href: "/dashboard/feature-flags",
    keywords: ["toggle", "rollout", "flags"],
  },
  {
    id: "webhooks",
    labelKey: "nav.goToWebhooks",
    href: "/dashboard/webhooks",
    keywords: ["events", "hooks", "endpoints"],
  },
  {
    id: "apiKeys",
    labelKey: "nav.goToApiKeys",
    href: "/dashboard/api-keys",
    keywords: ["tokens", "keys", "authentication"],
  },
  {
    id: "notifications",
    labelKey: "nav.goToNotifications",
    href: "/dashboard/notifications",
    keywords: ["alerts", "messages", "inbox"],
  },
  {
    id: "sessions",
    labelKey: "nav.goToSessions",
    href: "/dashboard/sessions",
    keywords: ["devices", "login", "revoke"],
  },
  {
    id: "settings",
    labelKey: "nav.goToSettings",
    href: "/dashboard/settings",
    keywords: ["config", "preferences", "theme"],
  },
  {
    id: "examples",
    labelKey: "nav.goToExamples",
    href: "/examples",
    keywords: ["components", "hooks", "demo"],
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
    true,
  );

  useKeyboardShortcut(
    "meta+k",
    useCallback((e) => {
      e.preventDefault();
      setOpen((o) => !o);
    }, []),
    true,
  );

  const onSelect = useCallback(
    (cmd: Command) => {
      router.push(cmd.href);
      setOpen(false);
    },
    [router],
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
