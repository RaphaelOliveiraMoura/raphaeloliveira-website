import * as React from "react";
import { NextIntlClientProvider } from "next-intl";

import type { Meta, StoryObj } from "@storybook/react";

import { TableOfContents } from "@/components/content/table-of-contents";

import commonMessages from "../../messages/en/common.json";

const meta = {
  title: "Content/TableOfContents",
  component: TableOfContents,
  parameters: {
    docs: {
      description: {
        component:
          "Sumario automatico que detecta headings (h2, h3) no container referenciado via ref. Usa MutationObserver + useSyncExternalStore para manter a lista atualizada dinamicamente.",
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
} satisfies Meta<typeof TableOfContents>;

export default meta;

type Story = StoryObj<typeof meta>;

function TocDemo() {
  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="flex gap-8">
      <aside className="w-48 shrink-0">
        <TableOfContents containerRef={containerRef} />
      </aside>
      <article
        ref={containerRef}
        className="prose prose-sm dark:prose-invert max-w-xl"
      >
        <h2>Introduction</h2>
        <p>This is the introduction section of the article.</p>
        <h2>Getting Started</h2>
        <p>Follow these steps to get started with the project.</p>
        <h3>Installation</h3>
        <p>Run npm install to install dependencies.</p>
        <h3>Configuration</h3>
        <p>Update the config file with your settings.</p>
        <h2>Advanced Usage</h2>
        <p>Learn about advanced patterns and techniques.</p>
        <h3>Custom Hooks</h3>
        <p>Create custom hooks for reusable logic.</p>
        <h2>FAQ</h2>
        <p>Frequently asked questions about the project.</p>
      </article>
    </div>
  );
}

export const Default: Story = {
  render: () => <TocDemo />,
  args: {
    containerRef: React.createRef<HTMLDivElement>(),
  },
};
