import type { Meta, StoryObj } from "@storybook/react";

import { VirtualList } from "@/components/shared/virtual-list";

type Item = { id: number; name: string; email: string };

const items: Item[] = Array.from({ length: 10_000 }, (_, i) => ({
  id: i,
  name: `Item ${i + 1}`,
  email: `user${i + 1}@example.com`,
}));

const defaultRenderItem = (item: unknown, index: number) => {
  const row = item as Item;
  return (
    <div className="flex items-center gap-4 border-b px-4 py-3">
      <span className="w-12 text-xs text-muted-foreground">#{index + 1}</span>
      <span className="font-medium">{row.name}</span>
      <span className="text-sm text-muted-foreground">{row.email}</span>
    </div>
  );
};

const meta = {
  title: "Shared/VirtualList",
  component: VirtualList,
  parameters: {
    docs: {
      description: {
        component:
          "Lista virtualizada via @tanstack/react-virtual. Renderiza apenas os itens visiveis, ideal para listas com milhares de itens.",
      },
    },
  },
  args: {
    items,
    estimateSize: 48,
    renderItem: defaultRenderItem,
    className: "h-[400px] overflow-auto rounded-lg border",
  },
} satisfies Meta<typeof VirtualList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LargeItems: Story = {
  name: "Itens Grandes",
  args: {
    items: items.slice(0, 1000),
    estimateSize: 80,
    renderItem: (item: unknown) => {
      const row = item as Item;
      return (
        <div className="border-b p-4">
          <h4 className="font-semibold">{row.name}</h4>
          <p className="text-sm text-muted-foreground">{row.email}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Additional content for demonstration.
          </p>
        </div>
      );
    },
    className: "h-[500px] overflow-auto rounded-lg border",
  },
};
