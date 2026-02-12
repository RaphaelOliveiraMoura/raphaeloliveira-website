import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
  KanbanBoard,
  type KanbanColumn,
} from "@/components/shared/kanban-board";

const meta = {
  title: "Shared/KanbanBoard",
  component: KanbanBoard,
  parameters: {
    docs: {
      description: {
        component:
          "Quadro Kanban com drag-and-drop baseado em @dnd-kit. Suporta mover itens entre colunas e reordenar dentro da mesma coluna. Acessivel via teclado.",
      },
    },
  },
} satisfies Meta<typeof KanbanBoard>;

export default meta;

type Story = StoryObj<typeof meta>;

const INITIAL_COLUMNS: KanbanColumn[] = [
  {
    id: "todo",
    title: "To Do",
    items: [
      {
        id: "1",
        title: "Research competitors",
        description: "Market analysis",
      },
      { id: "2", title: "Design mockups", description: "Figma prototypes" },
      { id: "3", title: "Write specs" },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    items: [
      { id: "4", title: "Implement auth", description: "JWT + refresh tokens" },
      { id: "5", title: "Setup CI/CD" },
    ],
  },
  {
    id: "done",
    title: "Done",
    items: [
      { id: "6", title: "Project setup", description: "Next.js + TypeScript" },
    ],
  },
];

function KanbanDemo() {
  const [columns, setColumns] = React.useState(INITIAL_COLUMNS);

  const handleMoveItem = (
    itemId: string,
    fromColumn: string,
    toColumn: string,
    newIndex: number,
  ) => {
    setColumns((prev) => {
      const from = prev.find((c) => c.id === fromColumn);
      const to = prev.find((c) => c.id === toColumn);
      if (!from || !to) return prev;

      const item = from.items.find((i) => i.id === itemId);
      if (!item) return prev;

      return prev.map((col) => {
        if (col.id === fromColumn) {
          return { ...col, items: col.items.filter((i) => i.id !== itemId) };
        }
        if (col.id === toColumn) {
          const newItems = [...col.items];
          newItems.splice(newIndex, 0, item);
          return { ...col, items: newItems };
        }
        return col;
      });
    });
  };

  return (
    <KanbanBoard
      columns={columns}
      onMoveItem={handleMoveItem}
      className="min-h-[400px]"
    />
  );
}

export const Default: Story = {
  render: () => <KanbanDemo />,
};
