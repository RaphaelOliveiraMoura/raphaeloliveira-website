"use client";

import { useState } from "react";

import { Flag, Plus, Trash2 } from "lucide-react";

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
  useCreateFeatureFlag,
  useDeleteFeatureFlag,
  useEvaluateFlags,
  useFeatureFlags,
  useUpdateFeatureFlag,
} from "@/lib/api/hooks";
import { toast } from "@/lib/feedback";
import { useTranslations } from "@/lib/i18n";

export default function FeatureFlagsPage() {
  const t = useTranslations("common");

  const [createOpen, setCreateOpen] = useState(false);
  const [formKey, setFormKey] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: flags, isLoading, error, refetch } = useFeatureFlags();
  const { data: evaluatedFlags } = useEvaluateFlags();

  const createFlag = useCreateFeatureFlag();
  const updateFlag = useUpdateFeatureFlag();
  const deleteFlag = useDeleteFeatureFlag();

  async function handleCreate() {
    try {
      await createFlag.mutateAsync({
        key: formKey,
        description: formDescription || undefined,
        enabled: false,
      });
      toast.success("Feature flag created");
      setCreateOpen(false);
      setFormKey("");
      setFormDescription("");
    } catch {
      toast.error("Failed to create feature flag");
    }
  }

  async function handleToggle(id: string, currentEnabled: boolean) {
    try {
      await updateFlag.mutateAsync({
        id,
        enabled: !currentEnabled,
      });
      toast.success(`Flag ${!currentEnabled ? "enabled" : "disabled"}`);
    } catch {
      toast.error("Failed to update flag");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteFlag.mutateAsync(deleteId);
      toast.success("Feature flag deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete feature flag");
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feature Flags</h1>
          <p className="text-muted-foreground">
            Manage feature toggles for gradual rollout
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 size-4" />
          Create Flag
        </Button>
      </div>

      {/* Evaluated Flags for Current User */}
      {evaluatedFlags && Object.keys(evaluatedFlags).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Your Evaluated Flags</CardTitle>
            <CardDescription>
              How flags resolve for your current user context.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(evaluatedFlags).map(([key, value]) => (
                <Badge key={key} variant={value ? "default" : "outline"}>
                  {key}: {value ? "ON" : "OFF"}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Flags List */}
      {error ? (
        <ErrorState
          title="Error loading feature flags"
          error={error}
          onRetry={() => void refetch()}
        />
      ) : isLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("loading")}
          </CardContent>
        </Card>
      ) : !flags || flags.length === 0 ? (
        <EmptyState
          icon={<Flag className="size-8" />}
          title="No feature flags"
          description="Create a feature flag to get started."
        />
      ) : (
        <div className="space-y-3">
          {flags.map((flag) => (
            <Card key={flag.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <Switch
                    checked={flag.enabled}
                    onCheckedChange={() => handleToggle(flag.id, flag.enabled)}
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-medium">{flag.key}</code>
                      <Badge variant={flag.enabled ? "default" : "secondary"}>
                        {flag.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    {flag.description && (
                      <p className="text-sm text-muted-foreground">
                        {flag.description}
                      </p>
                    )}
                    {flag.conditions && (
                      <div className="flex gap-1">
                        {flag.conditions.roles && (
                          <Badge variant="outline" className="text-xs">
                            Roles: {flag.conditions.roles.join(", ")}
                          </Badge>
                        )}
                        {flag.conditions.percentage !== undefined && (
                          <Badge variant="outline" className="text-xs">
                            {flag.conditions.percentage}% rollout
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => setDeleteId(flag.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Feature Flag</DialogTitle>
            <DialogDescription>
              Add a new feature flag. Use lowercase alphanumeric characters and
              hyphens.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Key</Label>
              <Input
                value={formKey}
                onChange={(e) => setFormKey(e.target.value)}
                placeholder="my-feature-flag"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="What this flag controls"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createFlag.isPending || !formKey.trim()}
            >
              {createFlag.isPending ? t("loading") : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Feature Flag"
        description="Are you sure? Any code checking this flag will default to disabled."
        onConfirm={handleDelete}
        isLoading={deleteFlag.isPending}
        variant="destructive"
      />
    </div>
  );
}
