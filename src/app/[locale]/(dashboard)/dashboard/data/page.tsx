"use client";

import { useState, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Download,
  MoreHorizontal,
  Search,
  Eye,
  Pencil,
} from "lucide-react";

import { useTranslations } from "@/lib/i18n";
import { useDebounce } from "@/hooks";
import { formatCpf } from "@/lib/formatters";
import { formatDate } from "@/lib/datetime";
import { exportToCsv, exportToJson } from "@/lib/data";
import { toast } from "@/lib/feedback";
import { MOCK_USERS, type MockUser } from "@/lib/utils/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DataTable, ConfirmDialog, VirtualList } from "@/components/shared";
import { HighlightMatch } from "@/components/search";
import { Breadcrumbs } from "@/components/navigation";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  inactive: "secondary",
  pending: "outline",
};

export default function DataPage() {
  const t = useTranslations("examples");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteCount, setPendingDeleteCount] = useState(0);
  const pageSize = 5;
  const debouncedSearch = useDebounce(search, 300);

  const filteredData = useMemo(() => {
    return MOCK_USERS.filter((user) => {
      const matchesSearch =
        !debouncedSearch ||
        user.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [debouncedSearch, roleFilter, statusFilter]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  const columns: ColumnDef<MockUser>[] = [
    {
      accessorKey: "name",
      header: t("data.name"),
      cell: ({ row }) => (
        <HighlightMatch text={row.original.name} query={debouncedSearch} />
      ),
    },
    {
      accessorKey: "email",
      header: t("data.email"),
      cell: ({ row }) => (
        <HighlightMatch text={row.original.email} query={debouncedSearch} />
      ),
    },
    {
      accessorKey: "cpf",
      header: t("data.cpf"),
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {formatCpf(row.original.cpf)}
        </span>
      ),
    },
    {
      accessorKey: "role",
      header: t("data.role"),
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.role}</Badge>
      ),
    },
    {
      accessorKey: "status",
      header: t("data.status"),
      cell: ({ row }) => (
        <Badge variant={STATUS_VARIANT[row.original.status] ?? "outline"}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: t("data.createdAt"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.createdAt, "short")}
        </span>
      ),
    },
    {
      id: "actions",
      header: t("data.actions"),
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-xs">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                toast.info(`${t("data.view")}: ${row.original.name}`)
              }
            >
              <Eye className="mr-2 size-4" />
              {t("data.view")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                toast.info(`${t("data.edit")}: ${row.original.name}`)
              }
            >
              <Pencil className="mr-2 size-4" />
              {t("data.edit")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleExportCsv = () => {
    exportToCsv(
      filteredData.map((u) => ({
        ...u,
        cpf: formatCpf(u.cpf),
        createdAt: formatDate(u.createdAt, "short"),
      })),
      "users.csv"
    );
    toast.success(t("data.exported"));
  };

  const handleExportJson = () => {
    exportToJson(filteredData, "users.json");
    toast.success(t("data.exported"));
  };

  const handleDeleteSelected = (rows: MockUser[]) => {
    setPendingDeleteCount(rows.length);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    toast.success(
      t("data.deleted", { count: pendingDeleteCount })
    );
    setDeleteDialogOpen(false);
  };

  const toolbar = (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("data.search")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9"
        />
      </div>
      <Select
        value={roleFilter}
        onValueChange={(v) => {
          setRoleFilter(v);
          setPage(1);
        }}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder={t("data.filterByRole")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("data.allRoles")}</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="editor">Editor</SelectItem>
          <SelectItem value="viewer">Viewer</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={statusFilter}
        onValueChange={(v) => {
          setStatusFilter(v);
          setPage(1);
        }}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder={t("data.filterByStatus")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("data.allStatuses")}</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleExportCsv}>
          <Download className="mr-2 size-4" />
          {t("data.exportCsv")}
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportJson}>
          <Download className="mr-2 size-4" />
          {t("data.exportJson")}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("data.title")}</h1>
        <p className="text-muted-foreground">{t("data.subtitle")}</p>
      </div>

      <DataTable
        columns={columns}
        data={paginatedData}
        rowSelection
        toolbar={toolbar}
        bulkActions={[
          {
            label: t("data.deleteSelected"),
            variant: "destructive",
            onClick: handleDeleteSelected,
          },
        ]}
        pagination={{
          page,
          pageSize,
          total: filteredData.length,
          onPageChange: setPage,
        }}
        enableSorting
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("data.deleteSelected")}
        description={t("data.confirmDelete", { count: pendingDeleteCount })}
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />

      <Separator />

      {/* Virtual List Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t("data.virtualList")}</CardTitle>
          <CardDescription>{t("data.virtualListDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <VirtualList
            items={MOCK_USERS}
            estimateSize={56}
            renderItem={(user, index) => (
              <div
                className="flex items-center justify-between border-b px-4 py-3"
                key={user.id}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-right text-xs text-muted-foreground">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <Badge variant={STATUS_VARIANT[user.status] ?? "outline"}>
                  {user.status}
                </Badge>
              </div>
            )}
            className="h-[280px] overflow-auto rounded-md border"
          />
        </CardContent>
      </Card>
    </div>
  );
}
