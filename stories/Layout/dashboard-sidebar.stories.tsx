import { NextIntlClientProvider } from "next-intl";

import type { Meta, StoryObj } from "@storybook/react";

import { DashboardSidebar } from "@/components/layouts/dashboard-sidebar";

import commonMessages from "../../messages/en/common.json";

const meta = {
  title: "Layout/DashboardSidebar",
  component: DashboardSidebar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Sidebar colapsavel do dashboard com animacao via Framer Motion. Suporta modo mobile (Sheet) e desktop (sidebar fixa). Active indicator animado com layoutId.",
      },
    },
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="en" messages={{ common: commonMessages }}>
        <div className="flex h-[500px]">
          <Story />
          <main className="flex-1 p-4">
            <p className="text-sm text-muted-foreground">Main content area</p>
          </main>
        </div>
      </NextIntlClientProvider>
    ),
  ],
} satisfies Meta<typeof DashboardSidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
