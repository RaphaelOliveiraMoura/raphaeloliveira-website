"use client";

import { useState } from "react";

import Link from "next/link";
import { ChevronsLeft, ChevronsRight, PanelLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-breakpoint";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarContent = (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-background transition-all",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-end p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {isCollapsed ? (
            <ChevronsRight className="size-4" />
          ) : (
            <ChevronsLeft className="size-4" />
          )}
        </Button>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-2" aria-label="Navegação principal">
        <Link
          href="/dashboard"
          className="rounded-md px-3 py-2 text-sm hover:bg-accent"
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/settings"
          className="rounded-md px-3 py-2 text-sm hover:bg-accent"
        >
          Configurações
        </Link>
      </nav>
    </aside>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Abrir menu"
          >
            <PanelLeft className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={cn(
        "hidden shrink-0 border-r transition-all lg:block",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {sidebarContent}
    </div>
  );
}
