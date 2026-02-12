"use client";

import { useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronsRight, PanelLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { Link, usePathname, useTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-breakpoint";

const NAV_ITEMS = [
  { href: "/dashboard", key: "dashboard" as const },
  { href: "/dashboard/data", key: "data" as const },
  { href: "/dashboard/forms", key: "forms" as const },
  { href: "/dashboard/settings", key: "settings" as const },
  { href: "/examples", key: "examples" as const },
];

export function DashboardSidebar() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const t = useTranslations("common");
  const pathname = usePathname();

  const sidebarContent = (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-background transition-all duration-normal",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-end p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={
            isCollapsed ? t("nav.expandSidebar") : t("nav.collapseSidebar")
          }
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <ChevronsRight className="size-4" />
          </motion.div>
        </Button>
      </div>
      <nav
        className="relative flex flex-1 flex-col gap-1 p-2"
        aria-label={t("nav.primary")}
      >
        {NAV_ITEMS.map((item, index) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard" ||
                pathname === "/pt-BR/dashboard" ||
                pathname === "/en/dashboard" ||
                pathname === "/es/dashboard"
              : pathname.includes(item.href);

          return (
            <motion.div
              key={item.key}
              initial={false}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.2,
                delay: isCollapsed ? 0 : index * 0.03,
              }}
              className="relative"
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute inset-0 rounded-md bg-accent"
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}
              <Link
                href={item.href}
                className={cn(
                  "relative z-10 flex items-center rounded-md px-3 py-2 text-sm transition-colors duration-fast",
                  isActive
                    ? "font-medium text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {t(`nav.${item.key}`)}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isCollapsed && (
                  <span className="text-xs font-medium">
                    {t(`nav.${item.key}`).charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
            </motion.div>
          );
        })}
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
            aria-label={t("nav.openSidebar")}
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
        "hidden shrink-0 border-r transition-all duration-normal lg:block",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {sidebarContent}
    </div>
  );
}
