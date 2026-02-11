import type { Meta, StoryObj } from "@storybook/react";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const meta: Meta<typeof Slider> = {
  title: "Form/Slider",
  component: Slider,
  parameters: {
    docs: {
      description: {
        component:
          "Range slider baseado em Radix UI. Suporta valor unico ou range (dois thumbs). Acessivel via teclado.",
      },
    },
  },
  argTypes: {
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    disabled: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <Slider defaultValue={[50]} max={100} step={1} />
    </div>
  ),
};

export const WithLabel: Story = {
  name: "Com Label",
  render: () => (
    <div className="w-full max-w-sm space-y-2">
      <div className="flex justify-between">
        <Label>Volume</Label>
        <span className="text-sm text-muted-foreground">75%</span>
      </div>
      <Slider defaultValue={[75]} max={100} step={1} />
    </div>
  ),
};

export const Range: Story = {
  name: "Range (dois valores)",
  render: () => (
    <div className="w-full max-w-sm space-y-2">
      <div className="flex justify-between">
        <Label>Price Range</Label>
        <span className="text-sm text-muted-foreground">$20 - $80</span>
      </div>
      <Slider defaultValue={[20, 80]} max={100} step={5} />
    </div>
  ),
};

export const Steps: Story = {
  name: "Com Steps",
  render: () => (
    <div className="w-full max-w-sm space-y-2">
      <Label>Quality (step: 25)</Label>
      <Slider defaultValue={[50]} max={100} step={25} />
    </div>
  ),
};

export const Disabled: Story = {
  name: "Desabilitado",
  render: () => (
    <div className="w-full max-w-sm">
      <Slider defaultValue={[50]} max={100} step={1} disabled />
    </div>
  ),
};
