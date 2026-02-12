import type { Meta, StoryObj } from "@storybook/react";

import { NotificationCenter } from "@/components/shared/notification-center";

const meta = {
  title: "Shared/NotificationCenter",
  component: NotificationCenter,
  parameters: {
    docs: {
      description: {
        component:
          "Central de notificacoes em Sheet lateral. Suporta categorias (info, success, warning, error), filtros, leitura e exclusao. Integra com useNotifications hook.",
      },
    },
  },
} satisfies Meta<typeof NotificationCenter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
