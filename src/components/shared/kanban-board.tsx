"use client";

import { useState } from "react";

import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import { cn } from "@/lib/utils";

interface KanbanItem {
  id: string;
  title: string;
  description?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  items: KanbanItem[];
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  onMoveItem: (
    itemId: string,
    fromColumn: string,
    toColumn: string,
    newIndex: number,
  ) => void;
  onReorderItem?: (columnId: string, itemId: string, newIndex: number) => void;
  className?: string;
}

export function KanbanBoard({
  columns,
  onMoveItem,
  onReorderItem,
  className,
}: KanbanBoardProps) {
  const [activeItem, setActiveItem] = useState<KanbanItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const findColumnByItemId = (itemId: string): KanbanColumn | undefined => {
    return columns.find((col) => col.items.some((item) => item.id === itemId));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const column = findColumnByItemId(active.id as string);
    const item = column?.items.find((i) => i.id === active.id);
    if (item) setActiveItem(item);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumnByItemId(activeId);
    const overColumn =
      findColumnByItemId(overId) ?? columns.find((col) => col.id === overId);

    if (!activeColumn || !overColumn || activeColumn.id === overColumn.id)
      return;

    const overIndex = overColumn.items.findIndex((i) => i.id === overId);
    const newIndex = overIndex >= 0 ? overIndex : overColumn.items.length;

    onMoveItem(activeId, activeColumn.id, overColumn.id, newIndex);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumnByItemId(activeId);
    const overColumn = findColumnByItemId(overId);

    if (
      activeColumn &&
      overColumn &&
      activeColumn.id === overColumn.id &&
      onReorderItem
    ) {
      const oldIndex = activeColumn.items.findIndex((i) => i.id === activeId);
      const newIndex = activeColumn.items.findIndex((i) => i.id === overId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(activeColumn.items, oldIndex, newIndex);
        const targetIndex = reordered.findIndex((i) => i.id === activeId);
        onReorderItem(activeColumn.id, activeId, targetIndex);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={cn("flex gap-4 overflow-x-auto pb-4", className)}>
        {columns.map((column) => (
          <KanbanColumnComponent key={column.id} column={column} />
        ))}
      </div>

      <DragOverlay>
        {activeItem && <KanbanCardOverlay item={activeItem} />}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumnComponent({ column }: { column: KanbanColumn }) {
  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg border bg-muted/30">
      <div className="flex items-center justify-between p-3">
        <h3 className="text-sm font-semibold">{column.title}</h3>
        <Badge variant="secondary">{column.items.length}</Badge>
      </div>
      <SortableContext
        items={column.items}
        strategy={verticalListSortingStrategy}
        id={column.id}
      >
        <ScrollArea className="flex-1 px-2 pb-2">
          <div className="min-h-[100px] space-y-2" data-column-id={column.id}>
            {column.items.map((item) => (
              <KanbanCard key={item.id} item={item} />
            ))}
          </div>
        </ScrollArea>
      </SortableContext>
    </div>
  );
}

function KanbanCard({ item }: { item: KanbanItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-default transition-shadow",
        isDragging && "z-50 opacity-50 shadow-lg",
      )}
    >
      <CardHeader className="flex-row items-start gap-2 p-3">
        <button
          type="button"
          className="text-muted-foreground mt-0.5 cursor-grab touch-none hover:text-foreground active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="size-4" />
        </button>
        <CardTitle className="text-sm font-medium leading-tight">
          {item.title}
        </CardTitle>
      </CardHeader>
      {item.description && (
        <CardContent className="px-3 pb-3 pt-0 pl-9">
          <p className="text-muted-foreground text-xs">{item.description}</p>
        </CardContent>
      )}
    </Card>
  );
}

function KanbanCardOverlay({ item }: { item: KanbanItem }) {
  return (
    <Card className="w-64 rotate-3 shadow-xl">
      <CardHeader className="flex-row items-start gap-2 p-3">
        <GripVerticalIcon className="text-muted-foreground mt-0.5 size-4" />
        <CardTitle className="text-sm font-medium leading-tight">
          {item.title}
        </CardTitle>
      </CardHeader>
      {item.description && (
        <CardContent className="px-3 pb-3 pt-0 pl-9">
          <p className="text-muted-foreground text-xs">{item.description}</p>
        </CardContent>
      )}
    </Card>
  );
}

export type { KanbanColumn, KanbanItem };
