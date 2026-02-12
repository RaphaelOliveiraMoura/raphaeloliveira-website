import { NextIntlClientProvider } from "next-intl";

import type { Meta, StoryObj } from "@storybook/react";

import { GlobalSearch } from "@/components/search/global-search";

import commonMessages from "../../messages/en/common.json";

const meta = {
  title: "Search/GlobalSearch",
  component: GlobalSearch,
  parameters: {
    docs: {
      description: {
        component:
          "Campo de busca global com debounce, historico de buscas recentes persistido em localStorage, e dropdown de sugestoes. Pronto para integrar com qualquer API de busca.",
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
} satisfies Meta<typeof GlobalSearch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <GlobalSearch />
    </div>
  ),
};
