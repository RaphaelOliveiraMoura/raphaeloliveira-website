import type { Meta, StoryObj } from "@storybook/react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const meta: Meta<typeof Accordion> = {
  title: "Navigation/Accordion",
  component: Accordion,
  parameters: {
    docs: {
      description: {
        component:
          "Accordion colapsavel baseado em Radix UI. Suporta modo single (apenas um aberto) ou multiple (varios abertos simultaneamente). Animacao suave de expand/collapse.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Accordion>;

export const Single: Story = {
  name: "Single (padrao)",
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-lg">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern. All keyboard
          interactions are supported.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that match the other components
          aesthetic.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It&apos;s animated by default, but you can disable it if you
          prefer.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  name: "Multiple (varios abertos)",
  render: () => (
    <Accordion
      type="multiple"
      defaultValue={["item-1", "item-2"]}
      className="w-full max-w-lg"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>What is Core Stack?</AccordionTrigger>
        <AccordionContent>
          Core Stack is a universal base template for Next.js projects. It
          provides a solid foundation of utilities, components, and patterns.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Which technologies are used?</AccordionTrigger>
        <AccordionContent>
          Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, shadcn/ui, and
          React Compiler.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it production-ready?</AccordionTrigger>
        <AccordionContent>
          Yes. All components are accessible (WCAG 2.1 AA), typed with
          TypeScript strict mode, and tested.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const FAQ: Story = {
  name: "Exemplo FAQ",
  render: () => (
    <div className="w-full max-w-lg">
      <h2 className="mb-4 text-lg font-semibold">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible>
        <AccordionItem value="faq-1">
          <AccordionTrigger>How do I install a new component?</AccordionTrigger>
          <AccordionContent>
            Run{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-sm">
              npx shadcn@latest add component-name
            </code>{" "}
            to install any shadcn/ui component.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="faq-2">
          <AccordionTrigger>Can I customize the theme?</AccordionTrigger>
          <AccordionContent>
            Yes! The design tokens are defined as CSS variables in{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-sm">
              globals.css
            </code>
            . Update the oklch values to change the entire color scheme.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="faq-3">
          <AccordionTrigger>Does it support dark mode?</AccordionTrigger>
          <AccordionContent>
            Yes. Dark mode is built-in via the{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-sm">.dark</code>{" "}
            class. Use the ThemeProvider to toggle between light, dark, and
            system themes.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};
