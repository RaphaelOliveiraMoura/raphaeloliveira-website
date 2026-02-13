"use client";

import { useState } from "react";

import { Copy, Key, Plus, Trash2 } from "lucide-react";

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

import { useApiKeys, useCreateApiKey, useRevokeApiKey } from "@/lib/api/hooks";
import { formatRelativeTime } from "@/lib/datetime";
import { toast } from "@/lib/feedback";
import { useTranslations } from "@/lib/i18n";
import { useClipboard } from "@/hooks";

export default function ApiKeysPage() {
  const t = useTranslations("common");
  const { copy } = useClipboard();

  const [createOpen, setCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [revokeId, setRevokeId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useApiKeys();
  const createApiKey = useCreateApiKey();
  const revokeApiKey = useRevokeApiKey();

  const apiKeys = data?.data ?? [];

  async function handleCreate() {
    try {
      const result = await createApiKey.mutateAsync({ name: newKeyName });
      setCreatedSecret(result.key);
      setNewKeyName("");
      toast.success("API key created");
    } catch {
      toast.error("Failed to create API key");
    }
  }

  async function handleRevoke() {
    if (!revokeId) return;
    try {
      await revokeApiKey.mutateAsync(revokeId);
      toast.success("API key revoked");
      setRevokeId(null);
    } catch {
      toast.error("Failed to revoke API key");
    }
  }

  function handleCopySecret() {
    if (createdSecret) {
      copy(createdSecret);
      toast.success("Copied to clipboard!");
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground">
            Manage your API keys for programmatic access
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 size-4" />
          Create Key
        </Button>
      </div>

      {error ? (
        <ErrorState
          title="Error loading API keys"
          error={error}
          onRetry={() => void refetch()}
        />
      ) : isLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("loading")}
          </CardContent>
        </Card>
      ) : apiKeys.length === 0 ? (
        <EmptyState
          icon={<Key className="size-8" />}
          title="No API keys"
          description="Create an API key to get started."
        />
      ) : (
        <div className="space-y-3">
          {apiKeys.map((key) => (
            <Card key={key.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Key className="size-4 text-muted-foreground" />
                    <p className="text-sm font-medium">{key.name}</p>
                    {key.scopes.length > 0 && (
                      <div className="flex gap-1">
                        {key.scopes.map((scope) => (
                          <Badge
                            key={scope}
                            variant="outline"
                            className="text-xs"
                          >
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Prefix: {key.prefix}*** | Created:{" "}
                    {formatRelativeTime(new Date(key.createdAt))}
                    {key.lastUsedAt &&
                      ` | Last used: ${formatRelativeTime(new Date(key.lastUsedAt))}`}
                    {key.expiresAt &&
                      ` | Expires: ${new Date(key.expiresAt).toLocaleDateString()}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => setRevokeId(key.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
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
            setNewKeyName("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              {createdSecret
                ? "Your API key has been created. Copy it now — it won't be shown again."
                : "Give your API key a descriptive name."}
            </DialogDescription>
          </DialogHeader>

          {createdSecret ? (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 rounded-md border bg-muted p-3">
                <code className="flex-1 text-sm break-all">
                  {createdSecret}
                </code>
                <Button variant="ghost" size="icon" onClick={handleCopySecret}>
                  <Copy className="size-4" />
                </Button>
              </div>
              <p className="text-xs text-destructive">
                Make sure to copy this key. You won&apos;t be able to see it
                again.
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="key-name">Name</Label>
                <Input
                  id="key-name"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="My API Key"
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
                  disabled={createApiKey.isPending || !newKeyName.trim()}
                >
                  {createApiKey.isPending ? t("loading") : "Create"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation */}
      <ConfirmDialog
        open={!!revokeId}
        onOpenChange={() => setRevokeId(null)}
        title="Revoke API Key"
        description="This will permanently revoke this API key. Any applications using it will lose access."
        onConfirm={handleRevoke}
        isLoading={revokeApiKey.isPending}
        variant="destructive"
      />
    </div>
  );
}
