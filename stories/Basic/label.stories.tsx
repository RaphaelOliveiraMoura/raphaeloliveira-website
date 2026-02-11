import type { Meta, StoryObj } from "@storybook/react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

const meta: Meta<typeof Label> = {
  title: "Basic/Label",
  component: Label,
  parameters: {
    docs: {
      description: {
        component:
          "Label acessivel baseado em Radix UI. Conecta-se automaticamente ao campo associado via `htmlFor`. Desabilita estilisticamente quando o campo associado esta desabilitado.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    children: "Email address",
    htmlFor: "email",
  },
};

export const WithInput: Story = {
  name: "Com Input",
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="user@example.com" />
    </div>
  ),
};

export const WithCheckbox: Story = {
  name: "Com Checkbox",
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
};

export const WithSwitch: Story = {
  name: "Com Switch",
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
};
