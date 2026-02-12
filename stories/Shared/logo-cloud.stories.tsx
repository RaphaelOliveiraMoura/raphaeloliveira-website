import type { Meta, StoryObj } from "@storybook/react";
import { Blocks, Cloud, Code2, Database, Globe, Layers } from "lucide-react";

import { LogoCloud, type LogoItem } from "@/components/shared/logo-cloud";

const LOGOS: LogoItem[] = [
  { id: "1", name: "Vercel", icon: <Blocks className="size-5" /> },
  { id: "2", name: "AWS", icon: <Cloud className="size-5" /> },
  { id: "3", name: "GitHub", icon: <Code2 className="size-5" /> },
  { id: "4", name: "Supabase", icon: <Database className="size-5" /> },
  { id: "5", name: "Cloudflare", icon: <Globe className="size-5" /> },
  { id: "6", name: "PlanetScale", icon: <Layers className="size-5" /> },
];

const meta = {
  title: "Shared/LogoCloud",
  component: LogoCloud,
  args: { logos: LOGOS },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Grid de logos de parceiros/clientes com efeito hover. Ideal para secoes de social proof em landing pages.",
      },
    },
  },
} satisfies Meta<typeof LogoCloud>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FewLogos: Story = {
  name: "Poucos Logos",
  args: { logos: LOGOS.slice(0, 3) },
};
