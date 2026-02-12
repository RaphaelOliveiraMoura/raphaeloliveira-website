import { NextIntlClientProvider } from "next-intl";

import type { Meta, StoryObj } from "@storybook/react";

import { MarketingFooter } from "@/components/layouts/marketing-footer";

import commonMessages from "../../messages/en/common.json";

const meta = {
  title: "Layout/MarketingFooter",
  component: MarketingFooter,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Footer do site marketing com logo, links de produto/recursos e copyright. Responsivo com layout em coluna no mobile.",
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
} satisfies Meta<typeof MarketingFooter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
