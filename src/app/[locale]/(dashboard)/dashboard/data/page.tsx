"use client";

import { useMemo, useState } from "react";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Search, Trash2, UserPlus } from "lucide-react";

import { Breadcrumbs } from "@/components/navigation";
import {
  ConfirmDialog,
  DataTable,
  EmptyState,
  ErrorState,
} from "@/components/shared";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUsers,
} from "@/lib/api/hooks";
import { formatDate, formatRelativeTime } from "@/lib/datetime";
import { toast } from "@/lib/feedback";
import { useTranslations } from "@/lib/i18n";
import { useDebounce } from "@/hooks";

import type { UserResponse } from "@/types/api";

const ROLE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  admin: "default",
  user: "secondary",
};

export default function DataPage() {
  const t = useTranslations("common");
  const te = useTranslations("examples");

  // Filtros e paginacao
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const debouncedSearch = useDebounce(searchInput, 300);

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserResponse | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<"admin" | "user">("user");

  // Queries e mutations
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useUsers({
    page,
    limit,
    search: debouncedSearch || undefined,
    role: roleFilter || undefined,
  });

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const users = usersData?.data ?? [];
  const meta = usersData?.meta;

  const columns: ColumnDef<UserResponse>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: te("data.name"),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.email}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: te("data.role"),
        cell: ({ row }) => (
          <Badge variant={ROLE_VARIANT[row.original.role] ?? "outline"}>
            {row.original.role}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: te("data.createdAt"),
        cell: ({ row }) => (
          <div>
            <p className="text-sm">
              {formatDate(row.original.createdAt, "short")}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(new Date(row.original.createdAt))}
            </p>
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setEditUser(row.original);
                  setFormName(row.original.name);
                  setFormEmail(row.original.email);
                  setFormRole(row.original.role as "admin" | "user");
                }}
              >
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeleteUserId(row.original.id)}
              >
                <Trash2 className="mr-2 size-4" />
                {t("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, te],
  );

  function resetForm() {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("user");
  }

  async function handleCreate() {
    try {
      await createUser.mutateAsync({
        name: formName,
        email: formEmail,
        password: formPassword,
        role: formRole,
      });
      toast.success("User created successfully");
      setCreateOpen(false);
      resetForm();
    } catch {
      toast.error("Failed to create user");
    }
  }

  async function handleUpdate() {
    if (!editUser) return;
    try {
      await updateUser.mutateAsync({
        id: editUser.id,
        name: formName,
        email: formEmail,
        role: formRole,
      });
      toast.success("User updated successfully");
      setEditUser(null);
      resetForm();
    } catch {
      toast.error("Failed to update user");
    }
  }

  async function handleDelete() {
    if (!deleteUserId) return;
    try {
      await deleteUser.mutateAsync(deleteUserId);
      toast.success("User deleted successfully");
      setDeleteUserId(null);
    } catch {
      toast.error("Failed to delete user");
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {te("data.title")}
          </h1>
          <p className="text-muted-foreground">{te("data.subtitle")}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <UserPlus className="mr-2 size-4" />
          Create User
        </Button>
      </div>

      <Separator />

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Users</CardTitle>
          <CardDescription>
            {meta
              ? t("table.showingResults", {
                  from: (page - 1) * limit + 1,
                  to: Math.min(page * limit, meta.total),
                  total: meta.total,
                })
              : t("loading")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("search.placeholder")}
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={(v) => {
                setRoleFilter(v === "all" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error ? (
            <ErrorState
              title="Error loading users"
              error={error}
              onRetry={() => void refetch()}
            />
          ) : users.length === 0 && !isLoading ? (
            <EmptyState
              icon={<Search className="size-8" />}
              title={t("table.noData")}
              description="Try adjusting your search or filters."
            />
          ) : (
            <DataTable columns={columns} data={users} isLoading={isLoading} />
          )}

          {/* Paginacao */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {meta.totalPages}
              </p>
              <div className="flex gap-2">
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
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>Add a new user to the system.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Name</Label>
              <Input
                id="create-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">Password</Label>
              <Input
                id="create-password"
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formRole}
                onValueChange={(v) => setFormRole(v as "admin" | "user")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                createUser.isPending || !formName || !formEmail || !formPassword
              }
            >
              {createUser.isPending ? t("loading") : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={!!editUser}
        onOpenChange={() => {
          setEditUser(null);
          resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formRole}
                onValueChange={(v) => setFormRole(v as "admin" | "user")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditUser(null);
                resetForm();
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateUser.isPending || !formName || !formEmail}
            >
              {updateUser.isPending ? t("loading") : t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteUserId}
        onOpenChange={() => setDeleteUserId(null)}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        onConfirm={handleDelete}
        isLoading={deleteUser.isPending}
        variant="destructive"
      />
    </div>
  );
}
