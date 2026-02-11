"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useTranslations } from "@/lib/i18n";

export interface ShortcutItem {
  id: string;
  keys: string;
  description: string;
}

interface ShortcutCheatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortcuts: ShortcutItem[];
}

export function ShortcutCheatSheet({
  open,
  onOpenChange,
  shortcuts,
}: ShortcutCheatSheetProps) {
  const t = useTranslations("common");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{t("shortcuts.title")}</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("shortcuts.shortcut")}</TableHead>
              <TableHead>{t("shortcuts.description")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shortcuts.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-sm">{item.keys}</TableCell>
                <TableCell>{item.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
