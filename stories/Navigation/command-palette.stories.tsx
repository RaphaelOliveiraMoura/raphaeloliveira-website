import { NextIntlClientProvider } from "next-intl";

import type { Meta, StoryObj } from "@storybook/react";

import { CommandPalette } from "@/components/navigation/command-palette";
import { Button } from "@/components/ui/button";

import commonMessages from "../../messages/en/common.json";

const meta = {
  title: "Navigation/CommandPalette",
  component: CommandPalette,
  parameters: {
    docs: {
      description: {
        component:
          "Paleta de comandos ativada via Ctrl+K / Cmd+K. Usa CommandDialog para busca fuzzy de rotas. Navega automaticamente ao selecionar um comando.",
      },
    },
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="en" messages={{ common: commonMessages }}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
} satisfies Meta<typeof CommandPalette>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Press{" "}
        <kbd className="rounded border px-1.5 py-0.5 text-xs font-medium">
          Ctrl+K
        </kbd>{" "}
        or{" "}
        <kbd className="rounded border px-1.5 py-0.5 text-xs font-medium">
          ⌘K
        </kbd>{" "}
        to open the command palette.
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const event = new KeyboardEvent("keydown", {
            key: "k",
            ctrlKey: true,
          });
          document.dispatchEvent(event);
        }}
      >
        Open Command Palette
      </Button>
      <CommandPalette />
    </div>
  ),
};
