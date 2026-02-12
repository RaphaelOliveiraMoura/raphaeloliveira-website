import { NextIntlClientProvider } from "next-intl";

import type { Meta, StoryObj } from "@storybook/react";

import { MarketingNavbar } from "@/components/layouts/marketing-navbar";

import commonMessages from "../../messages/en/common.json";

const meta = {
  title: "Layout/MarketingNavbar",
  component: MarketingNavbar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Navbar do site marketing com scroll detection (backdrop blur ao rolar). Suporta modo mobile (Sheet) e desktop (links inline). Usa useScrollPosition e useIsMobile.",
      },
    },
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="en" messages={{ common: commonMessages }}>
        <Story />
        <div className="h-[200vh] p-8">
          <p className="text-sm text-muted-foreground">
            Scroll down to see the navbar backdrop blur effect.
          </p>
        </div>
      </NextIntlClientProvider>
    ),
  ],
} satisfies Meta<typeof MarketingNavbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
