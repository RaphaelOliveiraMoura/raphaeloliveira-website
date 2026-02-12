import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { LiveRegion } from "@/components/shared/live-region";
import { Button } from "@/components/ui/button";

const meta = {
  title: "Shared/LiveRegion",
  component: LiveRegion,
  parameters: {
    docs: {
      description: {
        component:
          "Regiao ARIA live para anunciar mudancas de conteudo a leitores de tela. Invisivel visualmente (sr-only), essencial para acessibilidade.",
      },
    },
  },
} satisfies Meta<typeof LiveRegion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: "3 items loaded",
  },
};

function InteractiveDemo() {
  const [message, setMessage] = useState("");
  const [count, setCount] = useState(0);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        The live region is visually hidden but announced by screen readers. Open
        DevTools to inspect the sr-only element.
      </p>
      <Button
        onClick={() => {
          const next = count + 1;
          setCount(next);
          setMessage(`Action ${next} completed`);
        }}
      >
        Trigger announcement ({count})
      </Button>
      <LiveRegion message={message} />
      <p className="text-xs text-muted-foreground">
        Current message: {message || "(none)"}
      </p>
    </div>
  );
}

export const Interactive: Story = {
  name: "Interativo",
  args: {
    message: "",
  },
  render: () => <InteractiveDemo />,
};

export const Assertive: Story = {
  name: "Assertive (Urgente)",
  args: {
    message: "Error: form submission failed",
    politeness: "assertive",
  },
};
