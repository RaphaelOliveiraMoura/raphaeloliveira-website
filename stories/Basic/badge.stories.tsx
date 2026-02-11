import type { Meta, StoryObj } from "@storybook/react";
import { Check, AlertCircle, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const meta: Meta<typeof Badge> = {
  title: "Basic/Badge",
  component: Badge,
  parameters: {
    docs: {
      description: {
        component:
          "Badge para exibir status, categorias ou labels. Suporta variantes visuais e composicao com icones.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "ghost", "link"],
      description: "Variante visual do badge",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: "Badge",
    variant: "default",
  },
};

export const Variants: Story = {
  name: "Todas as Variantes",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="link">Link</Badge>
    </div>
  ),
};

export const WithIcon: Story = {
  name: "Com Icone",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="default"><Check /> Approved</Badge>
      <Badge variant="destructive"><AlertCircle /> Error</Badge>
      <Badge variant="secondary"><Clock /> Pending</Badge>
    </div>
  ),
};

export const StatusExamples: Story = {
  name: "Exemplo de Status",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="default">Active</Badge>
      <Badge variant="secondary">Draft</Badge>
      <Badge variant="destructive">Blocked</Badge>
      <Badge variant="outline">Archived</Badge>
    </div>
  ),
};
