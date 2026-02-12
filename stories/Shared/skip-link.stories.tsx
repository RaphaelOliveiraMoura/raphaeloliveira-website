import type { Meta, StoryObj } from "@storybook/react";

import { SkipLink } from "@/components/shared/skip-link";

const meta = {
  title: "Shared/SkipLink",
  component: SkipLink,
  parameters: {
    docs: {
      description: {
        component:
          "Link de pular para conteudo principal, visivel apenas via Tab. Fundamental para acessibilidade de navegacao por teclado.",
      },
    },
    layout: "fullscreen",
  },
} satisfies Meta<typeof SkipLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="min-h-[200px] p-4">
      <SkipLink />
      <p className="text-sm text-muted-foreground">
        Press Tab to reveal the skip link. It is hidden until focused.
      </p>
      <div id="main-content" className="mt-8 rounded border p-4">
        <h2 className="font-semibold">Main Content</h2>
        <p className="text-sm text-muted-foreground">
          The skip link targets this section.
        </p>
      </div>
    </div>
  ),
};
