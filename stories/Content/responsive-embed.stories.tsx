import type { Meta, StoryObj } from "@storybook/react";

import { ResponsiveEmbed } from "@/components/content/responsive-embed";

const meta = {
  title: "Content/ResponsiveEmbed",
  component: ResponsiveEmbed,
  parameters: {
    docs: {
      description: {
        component:
          "Wrapper responsivo para embeds de video (YouTube, generic iframe). Mantém aspecto 16:9 com AspectRatio. Extrai automaticamente video ID de URLs do YouTube.",
      },
    },
  },
} satisfies Meta<typeof ResponsiveEmbed>;

export default meta;

type Story = StoryObj<typeof meta>;

export const YouTube: Story = {
  args: {
    type: "youtube",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "Sample YouTube Video",
    className: "w-full max-w-2xl",
  },
};

export const Generic: Story = {
  name: "Embed Generico",
  args: {
    type: "generic",
    url: "https://www.openstreetmap.org/export/embed.html?bbox=-43.2,-22.95,-43.1,-22.85",
    title: "OpenStreetMap Embed",
    className: "w-full max-w-2xl",
  },
};
