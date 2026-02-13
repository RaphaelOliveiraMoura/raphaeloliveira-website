"use client";

import { useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Blocks,
  ChevronsRight,
  Database,
  FileSearch,
  FileText,
  Flag,
  Key,
  LayoutDashboard,
  MessageSquare,
  Monitor,
  PanelLeft,
  Search,
  Settings,
  Shield,
  Upload,
  Webhook,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Link, usePathname, useTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-breakpoint";

type NavKey =
  | "dashboard"
  | "data"
  | "feedback"
  | "uploads"
  | "search"
  | "forms"
  | "roles"
  | "audit"
  | "featureFlags"
  | "webhooks"
  | "apiKeys"
  | "notifications"
  | "sessions"
  | "settings"
  | "examples";

interface NavItem {
  href: string;
  key: NavKey;
  icon: typeof LayoutDashboard;
  group?: string;
}

const NAV_ITEMS: NavItem[] = [
  // Principal
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  // Dados
  { href: "/dashboard/data", key: "data", icon: Database, group: "data" },
  {
    href: "/dashboard/feedback",
    key: "feedback",
    icon: MessageSquare,
    group: "data",
  },
  { href: "/dashboard/uploads", key: "uploads", icon: Upload, group: "data" },
  { href: "/dashboard/search", key: "search", icon: Search, group: "data" },
  // Formularios
  { href: "/dashboard/forms", key: "forms", icon: FileText },
  // Administracao
  { href: "/dashboard/roles", key: "roles", icon: Shield, group: "admin" },
  { href: "/dashboard/audit", key: "audit", icon: FileSearch, group: "admin" },
  {
    href: "/dashboard/feature-flags",
    key: "featureFlags",
    icon: Flag,
    group: "admin",
  },
  {
    href: "/dashboard/webhooks",
    key: "webhooks",
    icon: Webhook,
    group: "admin",
  },
  { href: "/dashboard/api-keys", key: "apiKeys", icon: Key, group: "admin" },
  // Conta
  {
    href: "/dashboard/notifications",
    key: "notifications",
    icon: Bell,
    group: "account",
  },
  {
    href: "/dashboard/sessions",
    key: "sessions",
    icon: Monitor,
    group: "account",
  },
  {
    href: "/dashboard/settings",
    key: "settings",
    icon: Settings,
    group: "account",
  },
  // Exemplos
  { href: "/examples", key: "examples", icon: Blocks },
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
        className="relative flex flex-1 flex-col gap-1 overflow-y-auto p-2"
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

          const Icon = item.icon;
          const label = t(`nav.${item.key}`);

          const linkContent = (
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
                  "relative z-10 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-fast",
                  isCollapsed && "justify-center px-0",
                  isActive
                    ? "font-medium text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
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
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          );

          if (isCollapsed) {
            return (
              <Tooltip key={item.key}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
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
        "hidden shrink-0 transition-all duration-normal lg:block",
        "sticky top-0 h-screen",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {sidebarContent}
    </div>
  );
}
