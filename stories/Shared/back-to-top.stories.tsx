import type { Meta, StoryObj } from "@storybook/react";

import { BackToTop } from "@/components/shared/back-to-top";

const meta = {
  title: "Shared/BackToTop",
  component: BackToTop,
  parameters: {
    docs: {
      description: {
        component:
          "Botao flutuante que aparece apos scroll, com animacao de entrada/saida. Faz scroll suave de volta ao topo.",
      },
    },
    layout: "fullscreen",
  },
} satisfies Meta<typeof BackToTop>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="relative h-[200vh] bg-gradient-to-b from-background to-muted p-8">
      <p className="text-muted-foreground">
        Scroll down to see the Back to Top button appear.
      </p>
      <div className="fixed bottom-6 right-6">
        <BackToTop threshold={100} />
      </div>
    </div>
  ),
};
