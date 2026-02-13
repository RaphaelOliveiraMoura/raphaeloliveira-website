"use client";

import { useState } from "react";

import { Copy, ExternalLink, Play, Plus, Trash2, Webhook } from "lucide-react";

import { Breadcrumbs } from "@/components/navigation";
import { ConfirmDialog, EmptyState, ErrorState } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import {
  useCreateWebhook,
  useDeleteWebhook,
  useTestWebhook,
  useUpdateWebhook,
  useWebhookDeliveries,
  useWebhooks,
} from "@/lib/api/hooks";
import { formatRelativeTime } from "@/lib/datetime";
import { toast } from "@/lib/feedback";
import { useTranslations } from "@/lib/i18n";
import { useClipboard } from "@/hooks";

import type { WebhookResponse } from "@/types/api";

export default function WebhooksPage() {
  const t = useTranslations("common");
  const { copy } = useClipboard();

  const [createOpen, setCreateOpen] = useState(false);
  const [formUrl, setFormUrl] = useState("");
  const [formEvents, setFormEvents] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deliveriesId, setDeliveriesId] = useState<string | null>(null);

  const { data: webhooks, isLoading, error, refetch } = useWebhooks();
  const { data: deliveries } = useWebhookDeliveries(deliveriesId ?? "");

  const createWebhook = useCreateWebhook();
  const updateWebhook = useUpdateWebhook();
  const deleteWebhook = useDeleteWebhook();
  const testWebhook = useTestWebhook();

  async function handleCreate() {
    try {
      const events = formEvents
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      const result = await createWebhook.mutateAsync({
        url: formUrl,
        events,
        description: formDescription || undefined,
      });
      setCreatedSecret(result.secret);
      toast.success("Webhook created");
    } catch {
      toast.error("Failed to create webhook");
    }
  }

  async function handleToggleActive(webhook: WebhookResponse) {
    try {
      await updateWebhook.mutateAsync({
        id: webhook.id,
        active: !webhook.active,
      });
      toast.success(`Webhook ${!webhook.active ? "activated" : "deactivated"}`);
    } catch {
      toast.error("Failed to update webhook");
    }
  }

  async function handleTest(id: string) {
    try {
      await testWebhook.mutateAsync(id);
      toast.success("Test event sent!");
    } catch {
      toast.error("Failed to send test event");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteWebhook.mutateAsync(deleteId);
      toast.success("Webhook deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete webhook");
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Webhooks</h1>
          <p className="text-muted-foreground">
            Configure webhook endpoints for event notifications
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 size-4" />
          Create Webhook
        </Button>
      </div>

      {error ? (
        <ErrorState
          title="Error loading webhooks"
          error={error}
          onRetry={() => void refetch()}
        />
      ) : isLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("loading")}
          </CardContent>
        </Card>
      ) : !webhooks || webhooks.length === 0 ? (
        <EmptyState
          icon={<Webhook className="size-8" />}
          title="No webhooks"
          description="Create a webhook to receive event notifications."
        />
      ) : (
        <div className="space-y-3">
          {webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Switch
                      checked={webhook.active}
                      onCheckedChange={() => handleToggleActive(webhook)}
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <code className="text-sm">{webhook.url}</code>
                        <Badge
                          variant={webhook.active ? "default" : "secondary"}
                        >
                          {webhook.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {webhook.description && (
                        <p className="text-sm text-muted-foreground">
                          {webhook.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map((event) => (
                          <Badge
                            key={event}
                            variant="outline"
                            className="text-xs"
                          >
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() =>
                        setDeliveriesId(
                          deliveriesId === webhook.id ? null : webhook.id,
                        )
                      }
                    >
                      <ExternalLink className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => handleTest(webhook.id)}
                      disabled={testWebhook.isPending}
                    >
                      <Play className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive"
                      onClick={() => setDeleteId(webhook.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Deliveries panel */}
                {deliveriesId === webhook.id && deliveries?.data && (
                  <div className="mt-4 space-y-2 border-t pt-4">
                    <h4 className="text-sm font-medium">Recent Deliveries</h4>
                    {deliveries.data.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No deliveries yet.
                      </p>
                    ) : (
                      deliveries.data.slice(0, 5).map((delivery) => (
                        <div
                          key={delivery.id}
                          className="flex items-center justify-between rounded-md border p-2 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                delivery.statusCode &&
                                delivery.statusCode >= 200 &&
                                delivery.statusCode < 300
                                  ? "default"
                                  : "destructive"
                              }
                              className="text-xs"
                            >
                              {delivery.statusCode ?? "—"}
                            </Badge>
                            <span>{delivery.event}</span>
                          </div>
                          <span className="text-muted-foreground">
                            {formatRelativeTime(new Date(delivery.createdAt))}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            setCreatedSecret(null);
            setFormUrl("");
            setFormEvents("");
            setFormDescription("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Webhook</DialogTitle>
            <DialogDescription>
              {createdSecret
                ? "Webhook created. Copy the secret — it won't be shown again."
                : "Configure a new webhook endpoint."}
            </DialogDescription>
          </DialogHeader>

          {createdSecret ? (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 rounded-md border bg-muted p-3">
                <code className="flex-1 text-sm break-all">
                  {createdSecret}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    copy(createdSecret);
                    toast.success("Copied!");
                  }}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://example.com/webhook"
                  type="url"
                />
              </div>
              <div className="space-y-2">
                <Label>Events (comma-separated)</Label>
                <Input
                  value={formEvents}
                  onChange={(e) => setFormEvents(e.target.value)}
                  placeholder="user.created, user.updated"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            {createdSecret ? (
              <Button
                onClick={() => {
                  setCreateOpen(false);
                  setCreatedSecret(null);
                }}
              >
                Done
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={
                    createWebhook.isPending ||
                    !formUrl.trim() ||
                    !formEvents.trim()
                  }
                >
                  {createWebhook.isPending ? t("loading") : "Create"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Webhook"
        description="This will permanently delete this webhook and its delivery history."
        onConfirm={handleDelete}
        isLoading={deleteWebhook.isPending}
        variant="destructive"
      />
    </div>
  );
}
