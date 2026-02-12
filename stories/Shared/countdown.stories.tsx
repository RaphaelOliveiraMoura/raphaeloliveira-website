import type { Meta, StoryObj } from "@storybook/react";

import { Countdown } from "@/components/shared/countdown";

const IN_7_DAYS = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
const IN_1_HOUR = new Date(Date.now() + 1 * 60 * 60 * 1000);

const meta = {
  title: "Shared/Countdown",
  component: Countdown,
  args: { targetDate: IN_7_DAYS },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Timer regressivo com digitos animados. Util para lancamentos, eventos e campanhas com data-alvo.",
      },
    },
  },
} satisfies Meta<typeof Countdown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SoonExpiring: Story = {
  name: "Expirando em Breve",
  args: { targetDate: IN_1_HOUR },
};

export const CustomLabels: Story = {
  name: "Labels Customizados",
  args: {
    targetDate: IN_7_DAYS,
    labels: {
      days: "Dias",
      hours: "Horas",
      minutes: "Min",
      seconds: "Seg",
    },
  },
};
