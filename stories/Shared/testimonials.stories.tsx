import type { Meta, StoryObj } from "@storybook/react";

import {
  type TestimonialItem,
  Testimonials,
} from "@/components/shared/testimonials";

const ITEMS: TestimonialItem[] = [
  {
    id: "1",
    quote:
      "Core Stack saved us weeks of setup. The component library and hooks are production-ready out of the box.",
    name: "Ana Silva",
    role: "CTO @ TechStart",
    avatarFallback: "AS",
  },
  {
    id: "2",
    quote:
      "The i18n integration and accessibility patterns are exactly what we needed for our international product.",
    name: "Carlos Mendes",
    role: "Lead Developer @ GlobalApp",
    avatarFallback: "CM",
  },
  {
    id: "3",
    quote:
      "Best Next.js template I've used. The attention to detail in animations and UX is remarkable.",
    name: "Mariana Costa",
    role: "Design Engineer @ PixelCraft",
    avatarFallback: "MC",
  },
];

const meta = {
  title: "Shared/Testimonials",
  component: Testimonials,
  args: { items: ITEMS },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Grid de depoimentos com avatar, citacao, nome e cargo. Suporta 1, 2 ou 3 colunas com animacoes de entrada.",
      },
    },
  },
} satisfies Meta<typeof Testimonials>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TwoColumns: Story = {
  name: "Duas Colunas",
  args: { columns: 2 },
};

export const SingleColumn: Story = {
  name: "Uma Coluna",
  args: { columns: 1, items: ITEMS.slice(0, 2) },
};
