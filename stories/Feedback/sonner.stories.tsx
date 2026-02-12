import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

import { toast } from "@/lib/feedback";

const meta = {
  title: "Feedback/Sonner",
  component: Toaster,
  parameters: {
    docs: {
      description: {
        component:
          "Sistema de notificacoes toast baseado em Sonner. Suporta variantes (success, error, warning, info), acoes, promessas e posicionamento customizavel. Use o utilitario `toast` de `@/lib/feedback` para disparar toasts.",
      },
    },
  },
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
} satisfies Meta<typeof Toaster>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  name: "Todas as Variantes",
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() =>
          toast.success("Changes saved", {
            description: "Your profile has been updated.",
          })
        }
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.error("Something went wrong", {
            description: "Please try again later.",
          })
        }
      >
        Error
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.warning("Careful!", {
            description: "This action may have side effects.",
          })
        }
      >
        Warning
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.info("Did you know?", {
            description: "You can use keyboard shortcuts.",
          })
        }
      >
        Info
      </Button>
    </div>
  ),
};

export const WithAction: Story = {
  name: "Com Acao",
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toast.success("Item deleted", {
          action: {
            label: "Undo",
            onClick: () => toast.info("Item restored"),
          },
        })
      }
    >
      Delete with Undo
    </Button>
  ),
};

export const PromiseToast: Story = {
  name: "Promise Toast",
  render: () => (
    <Button
      variant="outline"
      onClick={() => {
        const promise = new Promise<void>((resolve) =>
          setTimeout(resolve, 2000),
        );
        toast.promise(promise, {
          loading: "Saving data...",
          success: "Data saved successfully!",
          error: "Failed to save data.",
        });
      }}
    >
      Save with Loading
    </Button>
  ),
};
