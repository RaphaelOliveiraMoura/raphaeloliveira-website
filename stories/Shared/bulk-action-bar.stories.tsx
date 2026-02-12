import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";

import { BulkActionBar } from "@/components/shared/bulk-action-bar";

const meta = {
  title: "Shared/BulkActionBar",
  component: BulkActionBar,
  parameters: {
    docs: {
      description: {
        component:
          "Barra de acoes em massa exibida quando itens sao selecionados. Suporta multiplas acoes com variantes de botao. Animada com Framer Motion.",
      },
    },
    layout: "padded",
  },
} satisfies Meta<typeof BulkActionBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    selectedCount: 5,
    actions: [
      { label: "Export", onClick: fn() },
      { label: "Delete", onClick: fn(), variant: "destructive" },
    ],
    onClearSelection: fn(),
  },
};

export const SingleAction: Story = {
  name: "Acao Unica",
  args: {
    selectedCount: 1,
    actions: [{ label: "Move to folder", onClick: fn() }],
    onClearSelection: fn(),
  },
};

export const ManyActions: Story = {
  name: "Multiplas Acoes",
  args: {
    selectedCount: 12,
    actions: [
      { label: "Archive", onClick: fn(), variant: "secondary" },
      { label: "Label", onClick: fn(), variant: "outline" },
      { label: "Delete", onClick: fn(), variant: "destructive" },
    ],
    onClearSelection: fn(),
  },
};
