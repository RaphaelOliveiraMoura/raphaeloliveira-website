---
name: tanstack-react-table
description: |
  TanStack React Table v8 for building data tables. Covers useReactTable, ColumnDef types (accessorKey, accessorFn, display), row models (sorting, filtering, pagination, selection), manual/server-side mode, and React Compiler compatibility.

  Use when building tables, defining columns, adding sorting/filtering/pagination, row selection, or when the user mentions DataTable, useReactTable, ColumnDef, or TanStack Table.
---

# TanStack React Table v8

**Versions**: @tanstack/react-table@8.21.3
**Docs**: https://tanstack.com/table/latest
**Note**: TanStack Table returns mutable objects. In projects with React Compiler, suppress the lint:

```ts
// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table manages its own state correctly
const table = useReactTable({ ... });
```

---

## Core API

### useReactTable

```tsx
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  flexRender,
} from "@tanstack/react-table";

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
});
```

### Column Definitions

Three types of columns:

```tsx
// 1. Accessor Column (data-driven, most common)
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",        // dot notation for nested: "address.city"
    header: "Name",
    cell: (info) => info.getValue(),  // optional custom render
  },

  // 2. Accessor Function (computed values)
  {
    id: "fullName",              // id required when using accessorFn
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    header: "Full Name",
  },

  // 3. Display Column (actions, selection, no data access)
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <button onClick={() => handleEdit(row.original)}>Edit</button>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
```

### Rendering

```tsx
<Table>
  <TableHeader>
    {table.getHeaderGroups().map((headerGroup) => (
      <TableRow key={headerGroup.id}>
        {headerGroup.headers.map((header) => (
          <TableHead key={header.id}>
            {header.isPlaceholder
              ? null
              : flexRender(header.column.columnDef.header, header.getContext())}
          </TableHead>
        ))}
      </TableRow>
    ))}
  </TableHeader>
  <TableBody>
    {table.getRowModel().rows.map((row) => (
      <TableRow key={row.id}>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## Features

### Sorting

```tsx
import { getSortedRowModel, type SortingState } from "@tanstack/react-table";

const [sorting, setSorting] = useState<SortingState>([]);

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  state: { sorting },
  onSortingChange: setSorting,
});

// In header:
<TableHead
  className={header.column.getCanSort() ? "cursor-pointer" : ""}
  onClick={header.column.getToggleSortingHandler()}
>
  {flexRender(header.column.columnDef.header, header.getContext())}
  {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted() as string] ?? ""}
</TableHead>
```

Per-column sorting config:
```tsx
{
  accessorKey: "name",
  header: "Name",
  enableSorting: true,         // default: true
  sortingFn: "alphanumeric",   // built-in: "alphanumeric" | "text" | "datetime" | "basic"
}
```

### Filtering

```tsx
import { getFilteredRowModel, type ColumnFiltersState } from "@tanstack/react-table";

const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
const [globalFilter, setGlobalFilter] = useState("");

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  state: { columnFilters, globalFilter },
  onColumnFiltersChange: setColumnFilters,
  onGlobalFilterChange: setGlobalFilter,
});

// Set column filter:
table.getColumn("status")?.setFilterValue("active");

// Global filter input:
<Input
  value={globalFilter}
  onChange={(e) => setGlobalFilter(e.target.value)}
  placeholder="Search..."
/>
```

Per-column filter config:
```tsx
{
  accessorKey: "status",
  header: "Status",
  enableColumnFilter: true,
  filterFn: "equals",          // built-in: "includesString" | "equals" | "arrIncludes" | etc.
}
```

### Pagination

```tsx
import { getPaginationRowModel, type PaginationState } from "@tanstack/react-table";

const [pagination, setPagination] = useState<PaginationState>({
  pageIndex: 0,
  pageSize: 10,
});

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  state: { pagination },
  onPaginationChange: setPagination,
});

// Navigation:
table.previousPage()            // go to previous page
table.nextPage()                // go to next page
table.setPageIndex(0)           // go to first page
table.getCanPreviousPage()      // boolean
table.getCanNextPage()          // boolean
table.getPageCount()            // total pages
table.getState().pagination.pageIndex  // current page (0-based)
```

### Row Selection

```tsx
import { type RowSelectionState } from "@tanstack/react-table";

const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  state: { rowSelection },
  onRowSelectionChange: setRowSelection,
  enableRowSelection: true,
  // getRowId: (row) => row.id,  // custom row ID (default: index)
});

// Selection column:
{
  id: "select",
  header: ({ table }) => (
    <Checkbox
      checked={table.getIsAllPageRowsSelected() ||
        (table.getIsSomePageRowsSelected() && "indeterminate")}
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="Select row"
    />
  ),
  enableSorting: false,
}

// Get selected rows:
const selectedRows = table.getSelectedRowModel().rows.map(r => r.original);
table.resetRowSelection();  // clear selection
```

### Column Visibility

```tsx
import { type VisibilityState } from "@tanstack/react-table";

const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

const table = useReactTable({
  // ...
  state: { columnVisibility },
  onColumnVisibilityChange: setColumnVisibility,
});

// Toggle column:
table.getColumn("email")?.toggleVisibility(false);
```

---

## Server-Side (Manual) Mode

For server-side sorting, filtering, and pagination:

```tsx
const table = useReactTable({
  data,                          // current page data from server
  columns,
  getCoreRowModel: getCoreRowModel(),
  // Do NOT include client-side row models:
  // getSortedRowModel: undefined
  // getFilteredRowModel: undefined
  // getPaginationRowModel: undefined
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  pageCount: Math.ceil(total / pageSize),  // server-provided total
  state: {
    pagination: { pageIndex: page - 1, pageSize },
    sorting: [{ id: sortField, desc: sortDir === "desc" }],
  },
  onPaginationChange: (updater) => {
    // sync with URL state or server fetch
  },
  onSortingChange: (updater) => {
    // sync with URL state or server fetch
  },
});
```

**Key rule**: when using `manual*` modes, do NOT include the corresponding `get*RowModel` (e.g., don't include `getSortedRowModel()` with `manualSorting: true`).

---

## Project Pattern: DataTable Component

The Core Stack provides `DataTable` in `@/components/shared/data-table`:

```tsx
import { DataTable, type DataTableProps } from "@/components/shared";

// Define columns
const columns: ColumnDef<User>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role" },
];

// Usage with server-side pagination
<DataTable
  columns={columns}
  data={users}
  pagination={{
    page: currentPage,
    pageSize: 10,
    total: totalUsers,
    onPageChange: setCurrentPage,
  }}
  sorting={{ field: "name", dir: "asc" }}
  onSortChange={(field, dir) => setSorting({ field, dir })}
  rowSelection
  bulkActions={[
    { label: "Delete", onClick: handleBulkDelete, variant: "destructive" },
  ]}
/>
```

---

## Common Mistakes

### Mistake #1: Missing getCoreRowModel
Every table MUST include `getCoreRowModel()`. It's the only required row model.

### Mistake #2: Client + Manual Mode Conflict
```tsx
// WRONG - client-side sorting WITH manualSorting
useReactTable({
  manualSorting: true,
  getSortedRowModel: getSortedRowModel(),  // conflicts!
});

// CORRECT - pick one
useReactTable({ manualSorting: true });  // server handles sorting
// OR
useReactTable({ getSortedRowModel: getSortedRowModel() });  // client handles sorting
```

### Mistake #3: Forgetting `id` on Display/AccessorFn Columns
```tsx
// WRONG - no id
{ accessorFn: (row) => row.first + row.last, header: "Name" }

// CORRECT
{ id: "fullName", accessorFn: (row) => row.first + row.last, header: "Name" }
```

### Mistake #4: Mutating State Directly
```tsx
// WRONG - TanStack Table state updaters can be functions
onSortingChange: (newSorting) => setSorting(newSorting)  // may receive function

// CORRECT - pass updater directly
onSortingChange: setSorting
// OR handle both:
onSortingChange: (updater) => {
  const next = typeof updater === "function" ? updater(current) : updater;
  setSorting(next);
}
```

### Mistake #5: React Compiler Warning
TanStack Table returns mutable objects. Always suppress with comment:
```ts
// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table manages its own state correctly
const table = useReactTable({ ... });
```

---

**Official docs**: https://tanstack.com/table/latest
**Examples**: https://tanstack.com/table/latest/docs/framework/react/examples
