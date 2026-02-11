import type { Meta, StoryObj } from "@storybook/react";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof Switch> = {
  title: "Form/Switch",
  component: Switch,
  parameters: {
    docs: {
      description: {
        component:
          "Toggle switch baseado em Radix UI. Dois tamanhos (default, sm). Ideal para configuracoes on/off.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm"],
    },
    disabled: {
      control: "boolean",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
};

export const Sizes: Story = {
  name: "Tamanhos",
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch id="sm" size="sm" />
        <Label htmlFor="sm">Small</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="default" />
        <Label htmlFor="default">Default</Label>
      </div>
    </div>
  ),
};

export const SettingsExample: Story = {
  name: "Exemplo de Configuracoes",
  render: () => (
    <div className="w-full max-w-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="marketing">Marketing emails</Label>
          <p className="text-sm text-muted-foreground">
            Receive emails about new products and features.
          </p>
        </div>
        <Switch id="marketing" />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="security">Security emails</Label>
          <p className="text-sm text-muted-foreground">
            Receive emails about your account security.
          </p>
        </div>
        <Switch id="security" defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="dark-mode">Dark mode</Label>
          <p className="text-sm text-muted-foreground">
            Toggle between light and dark theme.
          </p>
        </div>
        <Switch id="dark-mode" />
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  name: "Desabilitado",
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="disabled" disabled />
      <Label htmlFor="disabled">Disabled</Label>
    </div>
  ),
};
