"use client";

import { useState } from "react";
import {
  BellIcon,
  CheckCheckIcon,
  InfoIcon,
  CircleCheckIcon,
  TriangleAlertIcon,
  CircleXIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import { cn } from "@/lib/utils";
import {
  useNotifications,
  type Notification,
  type NotificationCategory,
} from "@/hooks/use-notifications";

const CATEGORY_CONFIG: Record<
  NotificationCategory,
  { icon: typeof InfoIcon; className: string }
> = {
  info: { icon: InfoIcon, className: "text-blue-500" },
  success: { icon: CircleCheckIcon, className: "text-green-500" },
  warning: { icon: TriangleAlertIcon, className: "text-yellow-500" },
  error: { icon: CircleXIcon, className: "text-red-500" },
};

const CATEGORY_FILTERS: Array<{ value: NotificationCategory | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "info", label: "Info" },
  { value: "success", label: "Success" },
  { value: "warning", label: "Warning" },
  { value: "error", label: "Error" },
];

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationCategory | "all">("all");
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();

  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.category === filter);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        className={cn("relative", className)}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 flex size-5 items-center justify-center p-0 text-[10px]"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex flex-col">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle>Notifications</SheetTitle>
              <div className="flex gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={markAllAsRead}
                    aria-label="Mark all as read"
                  >
                    <CheckCheckIcon />
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={clearAll}
                    aria-label="Clear all notifications"
                  >
                    <Trash2Icon />
                  </Button>
                )}
              </div>
            </div>
            <SheetDescription className="sr-only">
              Your notifications
            </SheetDescription>
          </SheetHeader>

          <div
            className="flex gap-1 overflow-x-auto px-4 pb-2"
            role="tablist"
            aria-label="Filter notifications"
          >
            {CATEGORY_FILTERS.map((cat) => (
              <Button
                key={cat.value}
                variant={filter === cat.value ? "secondary" : "ghost"}
                size="xs"
                onClick={() => setFilter(cat.value)}
                role="tab"
                aria-selected={filter === cat.value}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          <ScrollArea className="flex-1 px-4">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BellIcon className="text-muted-foreground mb-2 size-8" />
                <p className="text-muted-foreground text-sm">
                  No notifications
                </p>
              </div>
            ) : (
              <div className="space-y-2 pb-4">
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={markAsRead}
                    onRemove={removeNotification}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}

function NotificationItem({
  notification,
  onRead,
  onRemove,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const config = CATEGORY_CONFIG[notification.category];
  const Icon = config.icon;

  const formattedDate = new Date(notification.createdAt).toLocaleDateString(
    undefined,
    { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
  );

  return (
    <div
      className={cn(
        "group relative flex gap-3 rounded-lg border p-3 transition-colors",
        !notification.read && "bg-accent/50"
      )}
      role="article"
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", config.className)} />

      <button
        type="button"
        className="flex min-w-0 flex-1 flex-col gap-0.5 text-left"
        onClick={() => {
          if (!notification.read) onRead(notification.id);
        }}
      >
        <span className={cn("text-sm", !notification.read && "font-medium")}>
          {notification.title}
        </span>
        {notification.message && (
          <span className="text-muted-foreground text-xs">
            {notification.message}
          </span>
        )}
        <span className="text-muted-foreground text-xs">{formattedDate}</span>
      </button>

      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => onRemove(notification.id)}
        aria-label="Remove notification"
        className="opacity-0 transition-opacity group-hover:opacity-100"
      >
        <XIcon />
      </Button>
    </div>
  );
}
