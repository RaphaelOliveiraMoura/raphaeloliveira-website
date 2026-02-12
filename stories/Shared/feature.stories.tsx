import type { Meta, StoryObj } from "@storybook/react";

import { Feature } from "@/components/shared/feature";
import { Badge } from "@/components/ui/badge";

const meta = {
  title: "Shared/Feature",
  component: Feature,
  parameters: {
    docs: {
      description: {
        component:
          "Componente de feature flag condicional. Renderiza children somente quando a flag esta habilitada no ambiente atual. Aceita fallback opcional para quando a flag esta desabilitada.",
      },
    },
  },
} satisfies Meta<typeof Feature>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Enabled: Story = {
  name: "Flag Habilitada (newDashboard - dev)",
  args: {
    flag: "newDashboard",
    children: (
      <div className="rounded-md border border-green-500/30 bg-green-500/10 p-4">
        <p className="text-sm font-medium text-green-700 dark:text-green-400">
          New Dashboard feature is enabled!
        </p>
      </div>
    ),
  },
};

export const WithFallback: Story = {
  name: "Com Fallback",
  args: {
    flag: "betaFeatures",
    children: <Badge variant="default">Beta Feature Active</Badge>,
    fallback: <Badge variant="secondary">Coming Soon</Badge>,
  },
};
