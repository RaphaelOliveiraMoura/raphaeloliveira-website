import type { Meta, StoryObj } from "@storybook/react";

import { LoadingFallback } from "@/components/shared/loading-fallback";

const meta = {
  title: "Shared/LoadingFallback",
  component: LoadingFallback,
  parameters: {
    docs: {
      description: {
        component:
          "Spinner centralizado para uso como fallback de Suspense ou estados de carregamento.",
      },
    },
  },
} satisfies Meta<typeof LoadingFallback>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InContainer: Story = {
  name: "Dentro de Container",
  render: () => (
    <div className="h-64 w-96 rounded-lg border">
      <LoadingFallback />
    </div>
  ),
};
