"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDownIcon } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n";

import { BulkActionBar } from "@/components/shared/bulk-action-bar";

export interface DataTableBulkAction<TData> {
  label: string;
  onClick: (selectedRows: TData[]) => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export interface DataTableSortState {
  field: string;
  dir: "asc" | "desc";
}

export interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  pagination?: DataTablePaginationProps;
  sorting?: DataTableSortState;
  onSortChange?: (field: string, dir: "asc" | "desc") => void;
  rowSelection?: boolean;
  toolbar?: React.ReactNode;
  bulkActions?: DataTableBulkAction<TData>[];
  emptyMessage?: string;
  enableSorting?: boolean;
}

function withSelectionColumn<TData>(
  columns: ColumnDef<TData>[],
  rowSelection: boolean,
  t: (key: "table.selectAll" | "table.selectRow") => string
): ColumnDef<TData>[] {
  if (!rowSelection) return columns;
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label={t("table.selectAll")}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={t("table.selectRow")}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    ...columns,
  ];
}

export function DataTable<TData extends { id?: string }>({
  columns,
  data,
  pagination,
  sorting,
  onSortChange,
  rowSelection = false,
  toolbar,
  bulkActions = [],
  emptyMessage,
  enableSorting = true,
}: DataTableProps<TData>) {
  const t = useTranslations("common");
  const manualPagination = !!pagination;
  const pageCount = pagination
    ? Math.ceil(pagination.total / pagination.pageSize) || 1
    : -1;

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table manages its own state correctly
  const table = useReactTable({
    data,
    columns: withSelectionColumn(columns, rowSelection, t),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualPagination ? undefined : getSortedRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    manualPagination,
    manualSorting: !!onSortChange,
    pageCount: manualPagination ? pageCount : undefined,
    state: {
      pagination: manualPagination
        ? {
            pageIndex: (pagination?.page ?? 1) - 1,
            pageSize: pagination?.pageSize ?? 10,
          }
        : undefined,
      sorting: sorting
        ? [{ id: sorting.field, desc: sorting.dir === "desc" }]
        : undefined,
    },
    onPaginationChange: manualPagination
      ? (updater) => {
          const current = {
            pageIndex: (pagination?.page ?? 1) - 1,
            pageSize: pagination?.pageSize ?? 10,
          };
          const next =
            typeof updater === "function" ? updater(current) : updater;
          if (next.pageIndex !== current.pageIndex) {
            pagination?.onPageChange(next.pageIndex + 1);
          }
        }
      : undefined,
    onSortingChange: onSortChange
      ? (updater) => {
          const current = sorting
            ? [{ id: sorting.field, desc: sorting.dir === "desc" }]
            : [];
          const next =
            typeof updater === "function" ? updater(current) : updater;
          const first = next[0];
          if (first) {
            onSortChange(first.id, first.desc ? "desc" : "asc");
          }
        }
      : undefined,
    enableSorting,
  });

  const selectedCount = rowSelection
    ? table.getSelectedRowModel().rows.length
    : 0;

  const handleBulkAction = (action: DataTableBulkAction<TData>) => {
    const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
    action.onClick(selectedRows);
  };

  const handleClearSelection = () => {
    table.resetRowSelection();
  };

  const rows = table.getRowModel().rows;

  return (
    <div className="space-y-4">
      {toolbar && (
        <div className="flex items-center justify-end">{toolbar}</div>
      )}
      {rowSelection && selectedCount > 0 && (
        <BulkActionBar
          selectedCount={selectedCount}
          actions={bulkActions.map((action) => ({
            label: action.label,
            variant: action.variant,
            onClick: () => handleBulkAction(action),
          }))}
          onClearSelection={handleClearSelection}
        />
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort =
                    enableSorting &&
                    header.column.getCanSort() &&
                    onSortChange;
                  return (
                    <TableHead
                      key={header.id}
                      className={canSort ? "cursor-pointer select-none" : ""}
                      onClick={
                        canSort
                          ? () => header.column.toggleSorting()
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {canSort && (
                          <ArrowUpDownIcon
                            className={cn(
                              "size-4 opacity-50",
                              header.column.getIsSorted() && "opacity-100"
                            )}
                          />
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (rowSelection ? 1 : 0)}
                  className="h-24 text-center"
                >
                  <p className="text-muted-foreground text-sm">{emptyMessage ?? t("table.noData")}</p>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            {t("table.showingResults", {
              from: (pagination.page - 1) * pagination.pageSize + 1,
              to: Math.min(
                pagination.page * pagination.pageSize,
                pagination.total
              ),
              total: pagination.total,
            })}
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pagination.page > 1) {
                      pagination.onPageChange(pagination.page - 1);
                    }
                  }}
                  aria-disabled={pagination.page <= 1}
                  className={
                    pagination.page <= 1
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                />
              </PaginationItem>
              {(() => {
                const currentPage = pagination.page;
                const pages: number[] = [];
                const radius = 1;
                for (
                  let p = Math.max(1, currentPage - radius);
                  p <= Math.min(pageCount, currentPage + radius);
                  p++
                ) {
                  pages.push(p);
                }
                return pages.map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        pagination.onPageChange(pageNum);
                      }}
                      isActive={pagination.page === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ));
              })()}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pagination.page < pageCount) {
                      pagination.onPageChange(pagination.page + 1);
                    }
                  }}
                  aria-disabled={pagination.page >= pageCount}
                  className={
                    pagination.page >= pageCount
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
