import type { Meta, StoryObj } from "@storybook/react";
import { ChevronRight, Loader2, Mail, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

const meta: Meta<typeof Button> = {
  title: "Basic/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          "Botao acessivel baseado em Radix UI com variantes de estilo e tamanho. Suporta composicao via `asChild` para transformar qualquer elemento em botao.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
      description: "Variante visual do botao",
    },
    size: {
      control: "select",
      options: [
        "default",
        "xs",
        "sm",
        "lg",
        "icon",
        "icon-xs",
        "icon-sm",
        "icon-lg",
      ],
      description: "Tamanho do botao",
    },
    disabled: {
      control: "boolean",
      description: "Estado desabilitado",
    },
    asChild: {
      control: "boolean",
      description: "Renderiza como filho (Slot) para composicao",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
    size: "default",
  },
};

export const Variants: Story = {
  name: "Todas as Variantes",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const Sizes: Story = {
  name: "Todos os Tamanhos",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const WithIcon: Story = {
  name: "Com Icone",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button>
        <Mail />
        Login with Email
      </Button>
      <Button variant="outline">
        <Plus />
        Add Item
      </Button>
      <Button variant="secondary">
        Next
        <ChevronRight />
      </Button>
    </div>
  ),
};

export const IconOnly: Story = {
  name: "Apenas Icone",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="icon-xs">
        <Plus />
      </Button>
      <Button size="icon-sm">
        <Plus />
      </Button>
      <Button size="icon">
        <Plus />
      </Button>
      <Button size="icon-lg">
        <Plus />
      </Button>
    </div>
  ),
};

export const Loading: Story = {
  name: "Estado de Loading",
  render: () => (
    <Button disabled>
      <Loader2 className="animate-spin" />
      Please wait
    </Button>
  ),
};

export const Disabled: Story = {
  name: "Desabilitado",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button disabled>Default</Button>
      <Button variant="destructive" disabled>
        Destructive
      </Button>
      <Button variant="outline" disabled>
        Outline
      </Button>
      <Button variant="secondary" disabled>
        Secondary
      </Button>
      <Button variant="ghost" disabled>
        Ghost
      </Button>
      <Button variant="link" disabled>
        Link
      </Button>
    </div>
  ),
};

export const AsChild: Story = {
  name: "Composicao com asChild",
  render: () => (
    <Button asChild>
      <a href="https://example.com" target="_blank" rel="noopener noreferrer">
        Open Link
      </a>
    </Button>
  ),
};
