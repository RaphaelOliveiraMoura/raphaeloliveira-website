"use client";

import { useState } from "react";

import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Mail,
  Settings,
  Trash2,
} from "lucide-react";

import { Breadcrumbs } from "@/components/navigation";
import { ConfirmDialog, EmptyState, ErrorState } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationPreferences,
  useNotifications,
  useUnreadCount,
  useUpdateNotificationPreferences,
} from "@/lib/api/hooks";
import { formatRelativeTime } from "@/lib/datetime";
import { toast } from "@/lib/feedback";
import { useTranslations } from "@/lib/i18n";

import type { NotificationPreference } from "@/types/api";

export default function NotificationsPage() {
  const t = useTranslations("common");
  const [statusFilter, setStatusFilter] = useState<"all" | "read" | "unread">(
    "all",
  );
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useNotifications({ page, limit: 20, status: statusFilter });

  const { data: unreadData } = useUnreadCount();
  const { data: preferences, isLoading: prefsLoading } =
    useNotificationPreferences();

  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();
  const updatePreferences = useUpdateNotificationPreferences();

  const notifications = notificationsData?.data ?? [];
  const unreadCount = unreadData?.count ?? 0;

  async function handleMarkAllRead() {
    try {
      await markAllRead.mutateAsync();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteNotification.mutateAsync(deleteId);
      toast.success("Notification deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete notification");
    }
  }

  async function handleTogglePreference(
    pref: NotificationPreference,
    field: "inApp" | "email",
  ) {
    if (!preferences) return;
    const updated = preferences.map((p) =>
      p.channel === pref.channel ? { ...p, [field]: !p[field] } : p,
    );
    try {
      await updatePreferences.mutateAsync(updated);
      toast.success("Preferences updated");
    } catch {
      toast.error("Failed to update preferences");
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Manage your notifications and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{unreadCount} unread</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markAllRead.isPending || unreadCount === 0}
          >
            <CheckCheck className="mr-2 size-4" />
            Mark all read
          </Button>
        </div>
      </div>

      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox">
            <Bell className="mr-2 size-4" />
            Inbox
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings className="mr-2 size-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-4 pt-4">
          {/* Filter tabs */}
          <div className="flex gap-2">
            {(["all", "unread", "read"] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>

          {error ? (
            <ErrorState
              title="Error loading notifications"
              error={error}
              onRetry={() => void refetch()}
            />
          ) : isLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {t("loading")}
              </CardContent>
            </Card>
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={<BellOff className="size-8" />}
              title="No notifications"
              description="You're all caught up!"
            />
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={
                    notification.readAt
                      ? "opacity-60"
                      : "border-l-4 border-l-primary"
                  }
                >
                  <CardContent className="flex items-start justify-between py-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {notification.title}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {notification.type}
                        </Badge>
                      </div>
                      {notification.body && (
                        <p className="text-sm text-muted-foreground">
                          {notification.body}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(new Date(notification.createdAt))}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {!notification.readAt && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => markRead.mutate(notification.id)}
                        >
                          <Check className="size-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive"
                        onClick={() => setDeleteId(notification.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {notificationsData && notificationsData.total > 20 && (
                <div className="flex justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {prefsLoading ? (
                <p className="text-sm text-muted-foreground">{t("loading")}</p>
              ) : preferences && preferences.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground">
                    <span>Channel</span>
                    <span className="flex items-center gap-1">
                      <Bell className="size-3.5" /> In-App
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="size-3.5" /> Email
                    </span>
                  </div>
                  <Separator />
                  {preferences.map((pref) => (
                    <div
                      key={pref.channel}
                      className="grid grid-cols-3 items-center gap-4"
                    >
                      <span className="text-sm capitalize">{pref.channel}</span>
                      <Switch
                        checked={pref.inApp}
                        onCheckedChange={() =>
                          handleTogglePreference(pref, "inApp")
                        }
                      />
                      <Switch
                        checked={pref.email}
                        onCheckedChange={() =>
                          handleTogglePreference(pref, "email")
                        }
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No preferences configured.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Notification"
        description="Are you sure you want to delete this notification?"
        onConfirm={handleDelete}
        isLoading={deleteNotification.isPending}
        variant="destructive"
      />
    </div>
  );
}
