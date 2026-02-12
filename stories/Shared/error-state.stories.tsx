import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";

import { ErrorState } from "@/components/shared/error-state";

const meta = {
  title: "Shared/ErrorState",
  component: ErrorState,
  parameters: {
    docs: {
      description: {
        component:
          "Componente para exibir estados de erro com animacao. Inclui icone, titulo, mensagem e botao de retry opcional.",
      },
    },
  },
} satisfies Meta<typeof ErrorState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Something went wrong",
    message: "An unexpected error occurred. Please try again.",
    onRetry: fn(),
  },
};

export const WithError: Story = {
  name: "Com Objeto Error",
  args: {
    error: new Error("Failed to fetch data from server"),
    onRetry: fn(),
  },
};

export const CustomMessage: Story = {
  name: "Mensagem Customizada",
  args: {
    title: "Connection lost",
    message: "Please check your internet connection and try again.",
    onRetry: fn(),
  },
};

export const WithoutRetry: Story = {
  name: "Sem Retry",
  args: {
    title: "Access denied",
    message: "You do not have permission to view this resource.",
  },
};
