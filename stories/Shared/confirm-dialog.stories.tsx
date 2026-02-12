import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";

const meta = {
  title: "Shared/ConfirmDialog",
  component: ConfirmDialog,
  parameters: {
    docs: {
      description: {
        component:
          "Dialog de confirmacao baseado em AlertDialog. Suporta variante destrutiva e labels customizaveis. Usa i18n para labels padroes.",
      },
    },
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    title: "Confirm action",
    description: "Are you sure you want to proceed with this action?",
    onConfirm: fn(),
    onOpenChange: fn(),
  },
};

export const Destructive: Story = {
  name: "Variante Destrutiva",
  args: {
    open: true,
    title: "Delete item",
    description:
      "This action cannot be undone. This will permanently delete this item.",
    variant: "destructive",
    confirmLabel: "Delete",
    cancelLabel: "Keep",
    onConfirm: fn(),
    onOpenChange: fn(),
  },
};

function InteractiveDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Save changes?"
        description="You have unsaved changes. Do you want to save them before leaving?"
        confirmLabel="Save"
        cancelLabel="Discard"
        onConfirm={() => setOpen(false)}
      />
    </div>
  );
}

export const Interactive: Story = {
  name: "Interativo",
  args: {
    open: false,
    title: "Save changes?",
    description:
      "You have unsaved changes. Do you want to save them before leaving?",
    confirmLabel: "Save",
    cancelLabel: "Discard",
    onConfirm: fn(),
    onOpenChange: fn(),
  },
  render: () => <InteractiveDemo />,
};
