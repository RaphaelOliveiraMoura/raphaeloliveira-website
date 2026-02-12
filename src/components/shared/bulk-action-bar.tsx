"use client";

import type { ComponentProps } from "react";

import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

import { useTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ButtonVariant = NonNullable<ComponentProps<typeof Button>["variant"]>;

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
  const t = useTranslations("common");

  if (selectedCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2",
        className,
      )}
      role="region"
      aria-label={t("bulkActions.clearSelection")}
    >
      <span className="text-sm font-medium">
        {t("bulkActions.selected", { count: selectedCount })}
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
        aria-label={t("bulkActions.clearSelection")}
      >
        {t("bulkActions.clear")}
      </Button>
    </motion.div>
  );
}
