"use client";

import { useState } from "react";

import { Globe, Monitor, Smartphone, Trash2 } from "lucide-react";

import { Breadcrumbs } from "@/components/navigation";
import { ConfirmDialog, EmptyState, ErrorState } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  useRevokeAllSessions,
  useRevokeSession,
  useSessions,
} from "@/lib/api/hooks";
import { formatRelativeTime } from "@/lib/datetime";
import { toast } from "@/lib/feedback";
import { useTranslations } from "@/lib/i18n";

export default function SessionsPage() {
  const t = useTranslations("common");
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [revokeAllOpen, setRevokeAllOpen] = useState(false);

  const { data, isLoading, error, refetch } = useSessions();
  const revokeSession = useRevokeSession();
  const revokeAllSessions = useRevokeAllSessions();

  const sessions = data?.data ?? [];

  function getDeviceIcon(userAgent: string | null) {
    if (!userAgent) return Monitor;
    const ua = userAgent.toLowerCase();
    if (
      ua.includes("mobile") ||
      ua.includes("android") ||
      ua.includes("iphone")
    )
      return Smartphone;
    return Monitor;
  }

  async function handleRevoke() {
    if (!revokeId) return;
    try {
      await revokeSession.mutateAsync(revokeId);
      toast.success("Session revoked");
      setRevokeId(null);
    } catch {
      toast.error("Failed to revoke session");
    }
  }

  async function handleRevokeAll() {
    try {
      await revokeAllSessions.mutateAsync();
      toast.success("All other sessions revoked");
      setRevokeAllOpen(false);
    } catch {
      toast.error("Failed to revoke sessions");
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sessions</h1>
          <p className="text-muted-foreground">
            Manage your active sessions across devices
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setRevokeAllOpen(true)}
          disabled={sessions.filter((s) => !s.isCurrent).length === 0}
        >
          Revoke All Others
        </Button>
      </div>

      {error ? (
        <ErrorState
          title="Error loading sessions"
          error={error}
          onRetry={() => void refetch()}
        />
      ) : isLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("loading")}
          </CardContent>
        </Card>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={<Globe className="size-8" />}
          title="No sessions"
          description="No active sessions found."
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const DeviceIcon = getDeviceIcon(session.userAgent);
            return (
              <Card
                key={session.id}
                className={
                  session.isCurrent ? "border-l-4 border-l-green-500" : ""
                }
              >
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <DeviceIcon className="size-8 text-muted-foreground" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {session.deviceName ?? "Unknown Device"}
                        </p>
                        {session.isCurrent && (
                          <Badge variant="default">Current</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        IP: {session.ip ?? "Unknown"} | Agent:{" "}
                        {session.userAgent
                          ? session.userAgent.slice(0, 50) + "..."
                          : "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last active:{" "}
                        {session.lastActiveAt
                          ? formatRelativeTime(new Date(session.lastActiveAt))
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => setRevokeId(session.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!revokeId}
        onOpenChange={() => setRevokeId(null)}
        title="Revoke Session"
        description="This will sign out the device. Are you sure?"
        onConfirm={handleRevoke}
        isLoading={revokeSession.isPending}
        variant="destructive"
      />

      <ConfirmDialog
        open={revokeAllOpen}
        onOpenChange={setRevokeAllOpen}
        title="Revoke All Sessions"
        description="This will sign out all devices except the current one. Are you sure?"
        onConfirm={handleRevokeAll}
        isLoading={revokeAllSessions.isPending}
        variant="destructive"
      />
    </div>
  );
}
