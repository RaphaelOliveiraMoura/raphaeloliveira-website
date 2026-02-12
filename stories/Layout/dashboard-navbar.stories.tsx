import { NextIntlClientProvider } from "next-intl";

import type { Meta, StoryObj } from "@storybook/react";

import { DashboardNavbar } from "@/components/layouts/dashboard-navbar";

import commonMessages from "../../messages/en/common.json";

const meta = {
  title: "Layout/DashboardNavbar",
  component: DashboardNavbar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Navbar do dashboard com logo e navegacao secundaria. Sticky no topo com borda inferior. Usado no layout do dashboard.",
      },
    },
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="en" messages={{ common: commonMessages }}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
} satisfies Meta<typeof DashboardNavbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
