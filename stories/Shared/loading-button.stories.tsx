import type { Meta, StoryObj } from "@storybook/react";
import { Save, Trash2, Send } from "lucide-react";

import { LoadingButton } from "@/components/shared/loading-button";

const meta: Meta<typeof LoadingButton> = {
  title: "Shared/LoadingButton",
  component: LoadingButton,
  parameters: {
    docs: {
      description: {
        component:
          "Extensao do Button com estados de loading e success. Desabilita automaticamente durante loading. Ideal para acoes assincronas (salvar, enviar, deletar).",
      },
    },
  },
  argTypes: {
    loading: {
      control: "boolean",
      description: "Estado de carregamento (exibe spinner)",
    },
    success: {
      control: "boolean",
      description: "Estado de sucesso (exibe check)",
    },
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost"],
    },
  },
};

export default meta;

type Story = StoryObj<typeof LoadingButton>;

export const Default: Story = {
  args: {
    children: "Save Changes",
  },
};

export const Loading: Story = {
  name: "Estado Loading",
  args: {
    children: "Saving...",
    loading: true,
  },
};

export const Success: Story = {
  name: "Estado Sucesso",
  args: {
    children: "Saved!",
    success: true,
  },
};

export const AllStates: Story = {
  name: "Todos os Estados",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <LoadingButton>
        <Save className="mr-1 h-4 w-4" />
        Idle
      </LoadingButton>
      <LoadingButton loading>
        Saving...
      </LoadingButton>
      <LoadingButton success>
        Saved!
      </LoadingButton>
    </div>
  ),
};

export const Variants: Story = {
  name: "Com Variantes",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <LoadingButton loading>
        <Send className="mr-1 h-4 w-4" />
        Sending...
      </LoadingButton>
      <LoadingButton loading variant="destructive">
        <Trash2 className="mr-1 h-4 w-4" />
        Deleting...
      </LoadingButton>
      <LoadingButton loading variant="outline">
        Processing...
      </LoadingButton>
    </div>
  ),
};
