"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { useKeyboardShortcut } from "@/hooks";

interface Command {
  id: string;
  label: string;
  href: string;
  keywords?: string[];
}

const COMMANDS: Command[] = [
  {
    id: "dashboard",
    label: "Go to Dashboard",
    href: "/dashboard",
    keywords: ["panel", "home"],
  },
  {
    id: "users",
    label: "Users",
    href: "/users",
    keywords: ["people"],
  },
  {
    id: "posts",
    label: "Posts",
    href: "/posts",
    keywords: ["blog", "content"],
  },
  {
    id: "settings",
    label: "Settings",
    href: "/settings",
    keywords: ["config", "preferences"],
  },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

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
      title="Command palette"
      description="Search for a page to navigate..."
    >
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {COMMANDS.map((cmd) => (
            <CommandItem
              key={cmd.id}
              value={`${cmd.label} ${cmd.keywords?.join(" ") ?? ""}`}
              onSelect={() => onSelect(cmd)}
            >
              {cmd.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
