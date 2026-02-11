import type { Meta, StoryObj } from "@storybook/react";

import {
  SkeletonCard,
  SkeletonTable,
  SkeletonText,
} from "@/components/shared/skeleton-presets";

const meta = {
  title: "Shared/SkeletonPresets",
  parameters: {
    docs: {
      description: {
        component:
          "Presets de skeleton prontos para uso. SkeletonText para paragrafos, SkeletonCard para cards de perfil, SkeletonTable para tabelas de dados.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Text: Story = {
  name: "SkeletonText",
  render: () => (
    <div className="w-full max-w-md">
      <SkeletonText lines={4} />
    </div>
  ),
};

export const Card: Story = {
  name: "SkeletonCard",
  render: () => (
    <div className="w-full max-w-xs">
      <SkeletonCard />
    </div>
  ),
};

export const Table: Story = {
  name: "SkeletonTable",
  render: () => (
    <div className="w-full max-w-lg">
      <SkeletonTable rows={5} />
    </div>
  ),
};

export const Grid: Story = {
  name: "Grid de Cards",
  render: () => (
    <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  ),
};

export const PageLayout: Story = {
  name: "Layout de Pagina",
  render: () => (
    <div className="w-full max-w-2xl space-y-6">
      <div className="space-y-2">
        <SkeletonText lines={1} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonTable rows={4} />
    </div>
  ),
};
