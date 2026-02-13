"use client";

import { useState } from "react";

import { Plus, Shield, Trash2 } from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import {
  useCreateRole,
  useDeleteRole,
  usePermissions,
  useRoles,
  useSetRolePermissions,
} from "@/lib/api/hooks";
import { toast } from "@/lib/feedback";
import { useTranslations } from "@/lib/i18n";

import type { RoleResponse } from "@/types/api";

export default function RolesPage() {
  const t = useTranslations("common");

  const [createOpen, setCreateOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const { data: roles, isLoading, error, refetch } = useRoles();
  const { data: allPermissions } = usePermissions();

  const createRole = useCreateRole();
  const deleteRole = useDeleteRole();
  const setRolePermissions = useSetRolePermissions();

  async function handleCreate() {
    try {
      await createRole.mutateAsync({
        name: formName,
        description: formDescription || undefined,
      });
      toast.success("Role created");
      setCreateOpen(false);
      setFormName("");
      setFormDescription("");
    } catch {
      toast.error("Failed to create role");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteRole.mutateAsync(deleteId);
      toast.success("Role deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete role");
    }
  }

  function openPermissionEditor(role: RoleResponse) {
    setEditingRole(role);
    setSelectedPermissions(role.permissions.map((p) => p.id));
  }

  async function handleSavePermissions() {
    if (!editingRole) return;
    try {
      await setRolePermissions.mutateAsync({
        id: editingRole.id,
        permissionIds: selectedPermissions,
      });
      toast.success("Permissions updated");
      setEditingRole(null);
    } catch {
      toast.error("Failed to update permissions");
    }
  }

  function togglePermission(permId: string) {
    setSelectedPermissions((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId],
    );
  }

  // Agrupar permissoes por resource
  const permissionsByResource = (allPermissions ?? []).reduce<
    Record<string, typeof allPermissions>
  >((acc, perm) => {
    const key = perm.resource;
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(perm);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Roles & Permissions
          </h1>
          <p className="text-muted-foreground">
            Manage roles and their associated permissions
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 size-4" />
          Create Role
        </Button>
      </div>

      {error ? (
        <ErrorState
          title="Error loading roles"
          error={error}
          onRetry={() => void refetch()}
        />
      ) : isLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("loading")}
          </CardContent>
        </Card>
      ) : !roles || roles.length === 0 ? (
        <EmptyState
          icon={<Shield className="size-8" />}
          title="No roles"
          description="Create a role to get started."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{role.name}</CardTitle>
                  <div className="flex gap-1">
                    {role.isSystem && <Badge variant="secondary">System</Badge>}
                  </div>
                </div>
                {role.description && (
                  <CardDescription>{role.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {role.permissions.length > 0 ? (
                    role.permissions.slice(0, 5).map((perm) => (
                      <Badge
                        key={perm.id}
                        variant="outline"
                        className="text-xs"
                      >
                        {perm.key}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No permissions
                    </span>
                  )}
                  {role.permissions.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{role.permissions.length - 5} more
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openPermissionEditor(role)}
                  >
                    Edit Permissions
                  </Button>
                  {!role.isSystem && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => setDeleteId(role.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Role Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Role</DialogTitle>
            <DialogDescription>Add a new role to the system.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Role name"
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createRole.isPending || !formName.trim()}
            >
              {createRole.isPending ? t("loading") : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permission Editor Dialog */}
      <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Permissions: {editingRole?.name}</DialogTitle>
            <DialogDescription>
              Select which permissions this role should have.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 space-y-4 overflow-y-auto py-4">
            {Object.entries(permissionsByResource).map(([resource, perms]) => (
              <div key={resource}>
                <h4 className="mb-2 text-sm font-semibold capitalize">
                  {resource}
                </h4>
                <div className="space-y-2">
                  {(perms ?? []).map((perm) => (
                    <label
                      key={perm.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md border p-2 hover:bg-accent/50"
                    >
                      <Checkbox
                        checked={selectedPermissions.includes(perm.id)}
                        onCheckedChange={() => togglePermission(perm.id)}
                      />
                      <div>
                        <p className="text-sm font-medium">{perm.key}</p>
                        {perm.description && (
                          <p className="text-xs text-muted-foreground">
                            {perm.description}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                <Separator className="mt-3" />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRole(null)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSavePermissions}
              disabled={setRolePermissions.isPending}
            >
              {setRolePermissions.isPending ? t("loading") : t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Role"
        description="Are you sure you want to delete this role? Users with this role will lose their permissions."
        onConfirm={handleDelete}
        isLoading={deleteRole.isPending}
        variant="destructive"
      />
    </div>
  );
}
