import type { Meta, StoryObj } from "@storybook/react";

import { ResponsiveImage } from "@/components/shared/responsive-image";

const meta = {
  title: "Shared/ResponsiveImage",
  component: ResponsiveImage,
  parameters: {
    docs: {
      description: {
        component:
          "Wrapper sobre next/image com defaults otimizados: lazy loading, sizes responsivos, suporte a blur placeholder e fill mode. Simplifica o uso de imagens responsivas no projeto.",
      },
    },
  },
} satisfies Meta<typeof ResponsiveImage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: "https://picsum.photos/800/400",
    alt: "Sample landscape image",
    width: 800,
    height: 400,
    className: "rounded-lg",
  },
};

export const FillMode: Story = {
  name: "Fill Mode (container)",
  render: () => (
    <div className="relative h-64 w-full overflow-hidden rounded-lg">
      <ResponsiveImage
        src="https://picsum.photos/1200/600"
        alt="Fill mode image"
        fill
        className="object-cover"
      />
    </div>
  ),
};

export const WithPriority: Story = {
  name: "Com Priority (above the fold)",
  args: {
    src: "https://picsum.photos/600/300",
    alt: "Priority loaded image",
    width: 600,
    height: 300,
    priority: true,
    className: "rounded-md",
  },
};
