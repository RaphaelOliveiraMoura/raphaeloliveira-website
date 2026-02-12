import type { Meta, StoryObj } from "@storybook/react";

import { ScrollProgress } from "@/components/shared/scroll-progress";

const meta = {
  title: "Shared/ScrollProgress",
  component: ScrollProgress,
  parameters: {
    docs: {
      description: {
        component:
          "Barra de progresso fixa no topo que indica o progresso de scroll da pagina. Usa Framer Motion com spring physics.",
      },
    },
    layout: "fullscreen",
  },
} satisfies Meta<typeof ScrollProgress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="relative h-[300vh] bg-gradient-to-b from-background to-muted p-8">
      <ScrollProgress />
      <h2 className="text-xl font-bold">Scroll to see progress</h2>
      <p className="mt-4 text-muted-foreground">
        The progress bar at the top tracks your scroll position.
      </p>
    </div>
  ),
};
