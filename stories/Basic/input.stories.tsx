import type { Meta, StoryObj } from "@storybook/react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const meta = {
  title: "Basic/Input",
  component: Input,
  parameters: {
    docs: {
      description: {
        component:
          "Campo de entrada de texto com suporte a validacao, estados de erro e composicao com Label. Segue design tokens do tema.",
      },
    },
  },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search", "tel", "url"],
      description: "Tipo do input HTML",
    },
    placeholder: {
      control: "text",
      description: "Texto placeholder",
    },
    disabled: {
      control: "boolean",
      description: "Estado desabilitado",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: "text",
    placeholder: "Type something...",
  },
};

export const WithLabel: Story = {
  name: "Com Label",
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="user@example.com" />
    </div>
  ),
};

export const WithIcon: Story = {
  name: "Com Icone (composicao)",
  render: () => (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input className="pl-9" placeholder="Search..." />
    </div>
  ),
};

export const FileInput: Story = {
  name: "Input de Arquivo",
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="picture">Picture</Label>
      <Input id="picture" type="file" />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Disabled input",
    value: "Cannot edit this",
  },
};

export const Invalid: Story = {
  name: "Estado de Erro",
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="invalid-email">Email</Label>
      <Input
        type="email"
        id="invalid-email"
        placeholder="user@example.com"
        aria-invalid="true"
        defaultValue="invalid-email"
      />
      <p className="text-sm text-destructive">Email invalido</p>
    </div>
  ),
};

export const Types: Story = {
  name: "Tipos de Input",
  render: () => (
    <div className="grid w-full max-w-sm gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="text">Text</Label>
        <Input id="text" type="text" placeholder="Plain text" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="••••••••" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="number">Number</Label>
        <Input id="number" type="number" placeholder="42" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" />
      </div>
    </div>
  ),
};
