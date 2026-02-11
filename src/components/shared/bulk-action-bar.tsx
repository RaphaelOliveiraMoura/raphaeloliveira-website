"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

type ButtonVariant = NonNullable<
  ComponentProps<typeof Button>["variant"]
>;

export interface BulkAction {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
}

interface BulkActionBarProps {
  selectedCount: number;
  actions: BulkAction[];
  onClearSelection: () => void;
  className?: string;
}

export function BulkActionBar({
  selectedCount,
  actions,
  onClearSelection,
  className,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2",
        className
      )}
      role="region"
      aria-label={`${selectedCount} item(s) selected`}
    >
      <span className="text-sm font-medium">
        {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
      </span>
      <div className="flex gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant ?? "default"}
            size="sm"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ))}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        aria-label="Clear selection"
      >
        Clear
      </Button>
    </div>
  );
}
