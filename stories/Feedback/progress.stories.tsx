import type { Meta, StoryObj } from "@storybook/react";

import { Progress } from "@/components/ui/progress";

const meta: Meta<typeof Progress> = {
  title: "Feedback/Progress",
  component: Progress,
  parameters: {
    docs: {
      description: {
        component:
          "Barra de progresso baseada em Radix UI. Ideal para uploads, processamentos e indicadores de completude.",
      },
    },
  },
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Valor do progresso (0-100)",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: {
    value: 60,
    className: "w-[300px]",
  },
};

export const States: Story = {
  name: "Diferentes Valores",
  render: () => (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>Empty</span>
          <span>0%</span>
        </div>
        <Progress value={0} />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>Quarter</span>
          <span>25%</span>
        </div>
        <Progress value={25} />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>Half</span>
          <span>50%</span>
        </div>
        <Progress value={50} />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>Almost done</span>
          <span>75%</span>
        </div>
        <Progress value={75} />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>Complete</span>
          <span>100%</span>
        </div>
        <Progress value={100} />
      </div>
    </div>
  ),
};
