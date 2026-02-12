import type { Meta, StoryObj } from "@storybook/react";

import { FAQ, type FAQItem } from "@/components/shared/faq";

const ITEMS: FAQItem[] = [
  {
    id: "1",
    question: "What is Core Stack?",
    answer:
      "Core Stack is a universal base template for Next.js projects, including components, hooks, utilities, and best practices.",
  },
  {
    id: "2",
    question: "Is it free to use?",
    answer:
      "Yes, Core Stack is open-source and free for personal and commercial use under the MIT license.",
  },
  {
    id: "3",
    question: "Does it support internationalization?",
    answer:
      "Yes, Core Stack includes full i18n support with next-intl, supporting pt-BR, English, and Spanish out of the box.",
  },
  {
    id: "4",
    question: "Can I customize the design system?",
    answer:
      "Absolutely. The design system is built on Tailwind CSS and shadcn/ui, making it easy to customize colors, typography, and spacing.",
  },
];

const meta = {
  title: "Shared/FAQ",
  component: FAQ,
  args: { items: ITEMS },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Secao de FAQ com Accordion expansivel. Cada item contem pergunta e resposta. Anima ao entrar no viewport.",
      },
    },
  },
} satisfies Meta<typeof FAQ>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FewItems: Story = {
  name: "Poucos Itens",
  args: { items: ITEMS.slice(0, 2) },
};
