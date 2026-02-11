import type { Meta, StoryObj } from "@storybook/react";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof RadioGroup> = {
  title: "Form/RadioGroup",
  component: RadioGroup,
  parameters: {
    docs: {
      description: {
        component:
          "Grupo de radio buttons baseado em Radix UI. Permite selecao unica entre opcoes. Totalmente acessivel via teclado (setas).",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="comfortable">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="default" id="r1" />
        <Label htmlFor="r1">Default</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="comfortable" id="r2" />
        <Label htmlFor="r2">Comfortable</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="compact" id="r3" />
        <Label htmlFor="r3">Compact</Label>
      </div>
    </RadioGroup>
  ),
};

export const PlanSelection: Story = {
  name: "Selecao de Plano",
  render: () => (
    <RadioGroup defaultValue="pro" className="gap-4">
      <div className="flex items-start space-x-3 rounded-lg border p-4">
        <RadioGroupItem value="free" id="plan-free" className="mt-0.5" />
        <div className="grid gap-1">
          <Label htmlFor="plan-free" className="font-medium">
            Free
          </Label>
          <p className="text-sm text-muted-foreground">
            Up to 3 projects. Basic features.
          </p>
        </div>
      </div>
      <div className="flex items-start space-x-3 rounded-lg border p-4">
        <RadioGroupItem value="pro" id="plan-pro" className="mt-0.5" />
        <div className="grid gap-1">
          <Label htmlFor="plan-pro" className="font-medium">
            Pro — $9/mo
          </Label>
          <p className="text-sm text-muted-foreground">
            Unlimited projects. Advanced features.
          </p>
        </div>
      </div>
      <div className="flex items-start space-x-3 rounded-lg border p-4">
        <RadioGroupItem value="enterprise" id="plan-enterprise" className="mt-0.5" />
        <div className="grid gap-1">
          <Label htmlFor="plan-enterprise" className="font-medium">
            Enterprise — Custom
          </Label>
          <p className="text-sm text-muted-foreground">
            Dedicated support. Custom integrations.
          </p>
        </div>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  name: "Desabilitado",
  render: () => (
    <RadioGroup defaultValue="option-1" disabled>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-1" id="d1" />
        <Label htmlFor="d1">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-2" id="d2" />
        <Label htmlFor="d2">Option 2</Label>
      </div>
    </RadioGroup>
  ),
};
