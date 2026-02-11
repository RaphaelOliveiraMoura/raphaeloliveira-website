import type { Meta, StoryObj } from "@storybook/react";
import { FileX, Search, Inbox, Plus } from "lucide-react";
import { fn } from "storybook/test";

import { EmptyState } from "@/components/shared/empty-state";

const meta: Meta<typeof EmptyState> = {
  title: "Shared/EmptyState",
  component: EmptyState,
  parameters: {
    docs: {
      description: {
        component:
          "Placeholder para listas e secoes vazias. Inclui icone, titulo, descricao e acao opcional. Melhora UX indicando o proximo passo ao usuario.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    icon: <Inbox className="h-10 w-10" />,
    title: "No items yet",
    description: "Get started by creating your first item.",
    action: {
      label: "Create Item",
      onClick: fn(),
    },
  },
};

export const NoResults: Story = {
  name: "Sem Resultados de Busca",
  args: {
    icon: <Search className="h-10 w-10" />,
    title: "No results found",
    description: "Try adjusting your search or filters to find what you're looking for.",
  },
};

export const NoFiles: Story = {
  name: "Sem Arquivos",
  args: {
    icon: <FileX className="h-10 w-10" />,
    title: "No files uploaded",
    description: "Upload your first file to get started.",
    action: {
      label: "Upload File",
      onClick: fn(),
    },
  },
};

export const Minimal: Story = {
  name: "Minimo (sem icone)",
  args: {
    title: "Nothing here",
    description: "This section is empty.",
  },
};

export const WithAction: Story = {
  name: "Com Acao",
  render: () => (
    <EmptyState
      icon={<Plus className="h-10 w-10" />}
      title="No projects"
      description="Create your first project to organize your work."
      action={{
        label: "New Project",
        onClick: fn(),
      }}
    />
  ),
};
