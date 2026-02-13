"use client";

import { useMemo, useState } from "react";

import type { ColumnDef } from "@tanstack/react-table";
import { Download, FileSearch, Search } from "lucide-react";

import { Breadcrumbs } from "@/components/navigation";
import { DataTable, EmptyState, ErrorState } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { apiClient } from "@/lib/api";
import { useAuditLogs } from "@/lib/api/hooks";
import { downloadFile } from "@/lib/data";
import { formatDate, formatRelativeTime } from "@/lib/datetime";
import { toast } from "@/lib/feedback";
import { useTranslations } from "@/lib/i18n";
import { useDebounce } from "@/hooks";

import type { AuditLogResponse } from "@/types/api";

export default function AuditPage() {
  const t = useTranslations("common");
  const [searchInput, setSearchInput] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;
  const debouncedSearch = useDebounce(searchInput, 300);

  const { data, isLoading, error, refetch } = useAuditLogs({
    page,
    limit,
    search: debouncedSearch || undefined,
    action: actionFilter || undefined,
  });

  const logs = data?.data ?? [];
  const meta = data?.meta;

  async function handleExport(format: "csv" | "json") {
    try {
      const { data } = await apiClient.get<string | Record<string, unknown>>(
        `/audit/export?format=${format}`,
      );
      const content =
        typeof data === "string" ? data : JSON.stringify(data, null, 2);
      downloadFile(
        content,
        `audit-logs.${format}`,
        format === "csv" ? "text/csv" : "application/json",
      );
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch {
      toast.error("Failed to export");
    }
  }

  const columns: ColumnDef<AuditLogResponse>[] = useMemo(
    () => [
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.action}</Badge>
        ),
      },
      {
        accessorKey: "actorEmail",
        header: "Actor",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.actorEmail ?? "System"}</span>
        ),
      },
      {
        accessorKey: "resourceType",
        header: "Resource",
        cell: ({ row }) => (
          <div className="text-sm">
            <span>{row.original.resourceType ?? "—"}</span>
            {row.original.resourceId && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({row.original.resourceId.slice(0, 8)}...)
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "ip",
        header: "IP",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.ip ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Date",
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
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            Track all actions performed in the system
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("csv")}
          >
            <Download className="mr-2 size-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("json")}
          >
            <Download className="mr-2 size-4" />
            JSON
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity Log</CardTitle>
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
                placeholder="Search logs..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={actionFilter}
              onValueChange={(v) => {
                setActionFilter(v === "all" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="user.create">user.create</SelectItem>
                <SelectItem value="user.update">user.update</SelectItem>
                <SelectItem value="user.delete">user.delete</SelectItem>
                <SelectItem value="auth.login">auth.login</SelectItem>
                <SelectItem value="auth.logout">auth.logout</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error ? (
            <ErrorState
              title="Error loading audit logs"
              error={error}
              onRetry={() => void refetch()}
            />
          ) : logs.length === 0 && !isLoading ? (
            <EmptyState
              icon={<FileSearch className="size-8" />}
              title="No audit logs"
              description="No activity has been recorded yet."
            />
          ) : (
            <DataTable columns={columns} data={logs} isLoading={isLoading} />
          )}

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
    </div>
  );
}
