import type { Meta, StoryObj } from "@storybook/react";

import { OfflineBanner } from "@/components/shared/offline-banner";

const meta = {
  title: "Shared/OfflineBanner",
  component: OfflineBanner,
  parameters: {
    docs: {
      description: {
        component:
          "Banner exibido quando o usuario perde a conexao com a internet. Usa navigator.onLine via useOnlineStatus hook.",
      },
    },
    layout: "fullscreen",
  },
} satisfies Meta<typeof OfflineBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "O banner so aparece quando o navegador esta offline. Use DevTools > Network > Offline para testar.",
      },
    },
  },
};
