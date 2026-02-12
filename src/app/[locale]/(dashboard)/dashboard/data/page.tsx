"use client";

import { useMemo, useState } from "react";

import type { ColumnDef } from "@tanstack/react-table";
import { Download, Eye, MoreHorizontal, Pencil, Search } from "lucide-react";

import { Breadcrumbs } from "@/components/navigation";
import { HighlightMatch } from "@/components/search";
import { ConfirmDialog, DataTable, VirtualList } from "@/components/shared";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { downloadFile, exportToCsv, exportToJson } from "@/lib/data";
import {
  formatDate,
  formatDateRange,
  formatRelativeTime,
} from "@/lib/datetime";
import { toast } from "@/lib/feedback";
import {
  abbreviateNumber,
  capitalize,
  formatCep,
  formatCnpj,
  formatCpf,
  formatCurrency,
  pluralize,
  slugify,
  truncate,
} from "@/lib/formatters";
import { useTranslations } from "@/lib/i18n";
import { fuzzySearch } from "@/lib/search";
import { getContrastRatio, meetsContrastRatio } from "@/lib/utils/contrast";
import { MOCK_USERS, type MockUser } from "@/lib/utils/mock-data";
import { useDebounce } from "@/hooks";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  inactive: "secondary",
  pending: "outline",
};

const SEARCHABLE_ITEMS = [
  {
    id: "1",
    title: "Dashboard",
    description: "Main dashboard view",
    url: "/dashboard",
  },
  {
    id: "2",
    title: "Settings",
    description: "Application settings",
    url: "/settings",
  },
  {
    id: "3",
    title: "User Profile",
    description: "Edit your profile",
    url: "/profile",
  },
  {
    id: "4",
    title: "Analytics",
    description: "View analytics data",
    url: "/analytics",
  },
  {
    id: "5",
    title: "Reports",
    description: "Generate reports",
    url: "/reports",
  },
  {
    id: "6",
    title: "Users Management",
    description: "Manage users",
    url: "/users",
  },
  {
    id: "7",
    title: "Products",
    description: "Product catalog",
    url: "/products",
  },
];

// Datas pre-computadas para demo (fora do render para evitar impureza)
const DEMO_NOW = new Date();
const DEMO_ONE_HOUR_AGO = new Date(DEMO_NOW.getTime() - 3600000);
const DEMO_THREE_DAYS_AGO = new Date(DEMO_NOW.getTime() - 86400000 * 3);
const DEMO_NEXT_WEEK = new Date(DEMO_NOW.getTime() + 7 * 86400000);

function DateTimeSection() {
  const t = useTranslations("examples");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("data.datetime")}</CardTitle>
        <CardDescription>{t("data.datetimeDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              formatDate (short)
            </p>
            <p className="text-sm">{formatDate(DEMO_NOW, "short")}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              formatDate (long)
            </p>
            <p className="text-sm">{formatDate(DEMO_NOW, "long")}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              formatRelativeTime
            </p>
            <p className="text-sm">{formatRelativeTime(DEMO_ONE_HOUR_AGO)}</p>
            <p className="text-sm">{formatRelativeTime(DEMO_THREE_DAYS_AGO)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              formatDateRange
            </p>
            <p className="text-sm">
              {formatDateRange(DEMO_NOW, DEMO_NEXT_WEEK)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FuzzySearchSection() {
  const t = useTranslations("examples");
  const [query, setQuery] = useState("");
  const results = query ? fuzzySearch(SEARCHABLE_ITEMS, query) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("data.fuzzySearch")}</CardTitle>
        <CardDescription>{t("data.fuzzySearchDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Input
            placeholder="Try searching: 'dash', 'sett', 'anl'..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-sm"
          />
          {results.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {results.map((r) => (
                <Badge key={r.id} variant="secondary">
                  {r.title}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DataImportSection() {
  const t = useTranslations("examples");
  const [importResult, setImportResult] = useState<string | null>(null);

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { readFileAsText, parseCsv } = await import("@/lib/data/import");
    try {
      const text = await readFileAsText(file);
      if (file.name.endsWith(".csv")) {
        const result = parseCsv(text);
        setImportResult(
          `Parsed ${result.data.length} rows, ${result.headers.length} columns`,
        );
      } else {
        const parsed = JSON.parse(text);
        const count = Array.isArray(parsed) ? parsed.length : 1;
        setImportResult(`Parsed JSON: ${count} item(s)`);
      }
      toast.success("File imported successfully");
    } catch {
      setImportResult("Failed to parse file");
      toast.error("Failed to parse file");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("data.dataImport")}</CardTitle>
        <CardDescription>{t("data.dataImportDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <input
            type="file"
            accept=".csv,.json"
            onChange={handleFileImport}
            className="text-sm"
          />
          {importResult && <Badge variant="secondary">{importResult}</Badge>}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              downloadFile(
                "name,email\nJohn,john@test.com\nJane,jane@test.com",
                "sample.csv",
                "text/csv",
              );
              toast.success("Sample file downloaded");
            }}
          >
            <Download className="mr-2 size-4" />
            Download sample CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

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
        <span className="font-mono text-sm">{formatCpf(row.original.cpf)}</span>
      ),
    },
    {
      accessorKey: "role",
      header: t("data.role"),
      cell: ({ row }) => <Badge variant="secondary">{row.original.role}</Badge>,
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
      "users.csv",
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
    toast.success(t("data.deleted", { count: pendingDeleteCount }));
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

      <Separator />

      {/* Formatters Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t("data.formatters")}</CardTitle>
          <CardDescription>{t("data.formattersDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                formatCurrency
              </p>
              <p className="font-mono text-sm">{formatCurrency(1234.56)}</p>
              <p className="font-mono text-sm">{formatCurrency(9999999)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                formatCpf / formatCnpj / formatCep
              </p>
              <p className="font-mono text-sm">{formatCpf("12345678901")}</p>
              <p className="font-mono text-sm">
                {formatCnpj("12345678000195")}
              </p>
              <p className="font-mono text-sm">{formatCep("01001000")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                abbreviateNumber
              </p>
              <p className="font-mono text-sm">{abbreviateNumber(1500)}</p>
              <p className="font-mono text-sm">{abbreviateNumber(2500000)}</p>
              <p className="font-mono text-sm">
                {abbreviateNumber(1200000000)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                truncate
              </p>
              <p className="text-sm">
                {truncate(
                  "This is a very long text that should be truncated",
                  30,
                )}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                capitalize / slugify
              </p>
              <p className="text-sm">{capitalize("hello world")}</p>
              <p className="font-mono text-sm">{slugify("Hello World Test")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                pluralize
              </p>
              <p className="text-sm">0: {pluralize(0, "item")}</p>
              <p className="text-sm">1: {pluralize(1, "item")}</p>
              <p className="text-sm">5: {pluralize(5, "item")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date & Time Section */}
      <DateTimeSection />

      {/* Fuzzy Search Section */}
      <FuzzySearchSection />

      {/* Contrast Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t("data.contrast")}</CardTitle>
          <CardDescription>{t("data.contrastDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded border bg-black" />
                <div className="size-8 rounded border bg-white" />
                <div className="text-sm">
                  Ratio: {getContrastRatio("#000000", "#FFFFFF").toFixed(2)}:1
                  {" — "}
                  <Badge
                    variant={
                      meetsContrastRatio("#000000", "#FFFFFF", "AA")
                        ? "default"
                        : "destructive"
                    }
                  >
                    {meetsContrastRatio("#000000", "#FFFFFF", "AA")
                      ? "AA Pass"
                      : "AA Fail"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="size-8 rounded border"
                  style={{ backgroundColor: "#777777" }}
                />
                <div className="size-8 rounded border bg-white" />
                <div className="text-sm">
                  Ratio: {getContrastRatio("#777777", "#FFFFFF").toFixed(2)}:1
                  {" — "}
                  <Badge
                    variant={
                      meetsContrastRatio("#777777", "#FFFFFF", "AA")
                        ? "default"
                        : "destructive"
                    }
                  >
                    {meetsContrastRatio("#777777", "#FFFFFF", "AA")
                      ? "AA Pass"
                      : "AA Fail"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Import Section */}
      <DataImportSection />
    </div>
  );
}
