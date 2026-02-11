import type { Meta, StoryObj } from "@storybook/react";

import { AspectRatio } from "@/components/ui/aspect-ratio";

const meta: Meta<typeof AspectRatio> = {
  title: "Layout/AspectRatio",
  component: AspectRatio,
  parameters: {
    docs: {
      description: {
        component:
          "Mantem a proporcao de aspecto de conteudo interno. Baseado em Radix UI. Ideal para imagens, videos e embeds responsivos.",
      },
    },
  },
  argTypes: {
    ratio: {
      control: { type: "number" },
      description: "Proporcao (largura/altura). Ex: 16/9 = 1.777",
    },
  },
};

export default meta;

type Story = StoryObj<typeof AspectRatio>;

export const Image16x9: Story = {
  name: "Imagem 16:9",
  render: () => (
    <div className="w-[450px]">
      <AspectRatio ratio={16 / 9}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-muted text-muted-foreground">
          16:9 Aspect Ratio
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Square: Story = {
  name: "Quadrado 1:1",
  render: () => (
    <div className="w-[300px]">
      <AspectRatio ratio={1}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-muted text-muted-foreground">
          1:1 Square
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Ratios: Story = {
  name: "Multiplas Proporcoes",
  render: () => (
    <div className="grid grid-cols-3 gap-4 w-[600px]">
      <div>
        <p className="mb-2 text-sm font-medium">4:3</p>
        <AspectRatio ratio={4 / 3}>
          <div className="flex h-full w-full items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
            4:3
          </div>
        </AspectRatio>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">16:9</p>
        <AspectRatio ratio={16 / 9}>
          <div className="flex h-full w-full items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
            16:9
          </div>
        </AspectRatio>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">21:9</p>
        <AspectRatio ratio={21 / 9}>
          <div className="flex h-full w-full items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
            21:9
          </div>
        </AspectRatio>
      </div>
    </div>
  ),
};
