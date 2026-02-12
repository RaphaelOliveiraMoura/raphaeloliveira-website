import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { ErrorBoundary } from "@/components/shared/error-boundary";
import { Button } from "@/components/ui/button";

const meta = {
  title: "Shared/ErrorBoundary",
  component: ErrorBoundary,
  parameters: {
    docs: {
      description: {
        component:
          "Wrapper de captura de erros de renderizacao React (class component). Exibe ErrorState como fallback padrao com opcao de retry. Loga erros automaticamente via logger.",
      },
    },
  },
} satisfies Meta<typeof ErrorBoundary>;

export default meta;

type Story = StoryObj<typeof meta>;

function BuggyComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("This component crashed intentionally!");
  }
  return (
    <div className="rounded-md border p-4">
      <p className="text-sm">This component is working correctly.</p>
    </div>
  );
}

function ErrorBoundaryDemo() {
  const [shouldThrow, setShouldThrow] = React.useState(false);
  const [key, setKey] = React.useState(0);

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="flex gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            setShouldThrow(true);
            setKey((k) => k + 1);
          }}
        >
          Trigger Error
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setShouldThrow(false);
            setKey((k) => k + 1);
          }}
        >
          Reset
        </Button>
      </div>
      <ErrorBoundary key={key}>
        <BuggyComponent shouldThrow={shouldThrow} />
      </ErrorBoundary>
    </div>
  );
}

export const Default: Story = {
  render: () => <ErrorBoundaryDemo />,
};

export const WithCustomFallback: Story = {
  name: "Com Fallback Customizado",
  render: () => {
    function AlwaysThrows() {
      throw new Error("Always throws");
      return null;
    }
    return (
      <ErrorBoundary
        fallback={
          <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
            <p className="text-destructive font-medium">
              Custom fallback: Something went wrong.
            </p>
          </div>
        }
      >
        <AlwaysThrows />
      </ErrorBoundary>
    );
  },
};
