import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";

import {
  PricingTable,
  type PricingTier,
} from "@/components/shared/pricing-table";

const TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    description: "For personal projects and experimentation.",
    price: "$0",
    period: "month",
    ctaLabel: "Get Started",
    onCtaClick: fn(),
    features: [
      { text: "Up to 3 projects", included: true },
      { text: "1 GB storage", included: true },
      { text: "Community support", included: true },
      { text: "Custom domains", included: false },
      { text: "Analytics", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "For professionals and growing teams.",
    price: "$29",
    period: "month",
    ctaLabel: "Start Free Trial",
    onCtaClick: fn(),
    badge: "Most Popular",
    features: [
      { text: "Unlimited projects", included: true },
      { text: "50 GB storage", included: true },
      { text: "Priority support", included: true },
      { text: "Custom domains", included: true },
      { text: "Analytics", included: true },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations with custom needs.",
    price: "$99",
    period: "month",
    ctaLabel: "Contact Sales",
    onCtaClick: fn(),
    features: [
      { text: "Unlimited everything", included: true },
      { text: "500 GB storage", included: true },
      { text: "Dedicated support", included: true },
      { text: "Custom domains", included: true },
      { text: "Advanced analytics", included: true },
    ],
  },
];

const meta = {
  title: "Shared/PricingTable",
  component: PricingTable,
  args: { tiers: TIERS, highlightedTier: "pro" },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Tabela de precos com tiers lado a lado, destaque no tier recomendado, badge e lista de features.",
      },
    },
  },
} satisfies Meta<typeof PricingTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TwoTiers: Story = {
  name: "Dois Tiers",
  args: {
    tiers: TIERS.slice(0, 2),
    highlightedTier: "pro",
  },
};

export const NoHighlight: Story = {
  name: "Sem Destaque",
  args: { highlightedTier: undefined },
};
