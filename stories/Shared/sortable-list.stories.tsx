import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { SortableList } from "@/components/shared/sortable-list";
import { Badge } from "@/components/ui/badge";

const meta = {
  title: "Shared/SortableList",
  component: SortableList,
  parameters: {
    docs: {
      description: {
        component:
          "Lista reordenavel com drag-and-drop baseada em @dnd-kit. Handle de arrasto integrado, acessibilidade via teclado e feedback visual durante o drag.",
      },
    },
  },
} satisfies Meta<typeof SortableList>;

export default meta;

type Story = StoryObj<typeof meta>;

interface Task {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
}

const INITIAL_TASKS: Task[] = [
  { id: "1", title: "Review pull requests", priority: "high" },
  { id: "2", title: "Update documentation", priority: "medium" },
  { id: "3", title: "Fix login bug", priority: "high" },
  { id: "4", title: "Write unit tests", priority: "low" },
  { id: "5", title: "Deploy to staging", priority: "medium" },
];

function SortableListDemo() {
  const [tasks, setTasks] = React.useState(INITIAL_TASKS);

  return (
    <div className="w-full max-w-md">
      <SortableList
        items={tasks}
        onReorder={setTasks}
        renderItem={(item) => (
          <div className="flex items-center justify-between">
            <span className="text-sm">{item.title}</span>
            <Badge
              variant={
                item.priority === "high"
                  ? "destructive"
                  : item.priority === "medium"
                    ? "default"
                    : "secondary"
              }
            >
              {item.priority}
            </Badge>
          </div>
        )}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <SortableListDemo />,
};
