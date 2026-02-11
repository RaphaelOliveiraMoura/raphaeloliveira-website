import type { Meta, StoryObj } from "@storybook/react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof Checkbox> = {
  title: "Form/Checkbox",
  component: Checkbox,
  parameters: {
    docs: {
      description: {
        component:
          "Checkbox acessivel baseado em Radix UI. Suporta estados checked, unchecked e indeterminate. Integra com react-hook-form.",
      },
    },
  },
  argTypes: {
    checked: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
};

export const Checked: Story = {
  name: "Marcado",
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="checked" defaultChecked />
      <Label htmlFor="checked">This is checked</Label>
    </div>
  ),
};

export const Disabled: Story = {
  name: "Desabilitado",
  render: () => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-unchecked" disabled />
        <Label htmlFor="disabled-unchecked">Disabled unchecked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-checked" disabled defaultChecked />
        <Label htmlFor="disabled-checked">Disabled checked</Label>
      </div>
    </div>
  ),
};

export const FormExample: Story = {
  name: "Exemplo de Formulario",
  render: () => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Notification Preferences</h4>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox id="email-notifications" defaultChecked />
          <Label htmlFor="email-notifications">Email notifications</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="push-notifications" />
          <Label htmlFor="push-notifications">Push notifications</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="sms-notifications" />
          <Label htmlFor="sms-notifications">SMS notifications</Label>
        </div>
      </div>
    </div>
  ),
};
