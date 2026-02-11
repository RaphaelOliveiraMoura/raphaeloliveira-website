# Exibição & Gestão de Dados

> **Status:** `rascunho`
> **Prioridade:** `alta`
> **Última atualização:** 2026-02-11

## Resumo

Sistema de exibição e gerenciamento de dados para o Core Stack: DataTable com TanStack Table (ordenação servidor/cliente, filtros compostos, visibilidade de colunas, seleção e bulk actions, edição inline, virtualização), listas e grids (infinite scroll, listas virtualizadas, toggle grid/lista, empty states), exportação (CSV, Excel, JSON, PDF), padrões CRUD (criar em modal ou página dedicada, editar, excluir com confirmação, optimistic updates, feedback) e composição completa de DataTable + Forms + API + URL State para gestão de recursos.

## Motivação

Admin panels, dashboards e aplicações SaaS dependem de tabelas de dados avançadas, listas paginadas e fluxos CRUD padronizados. O Core Stack deve oferecer um kit pronto para reduzir tempo de desenvolvimento e garantir consistência: DataTable configurável, exportação em múltiplos formatos, fluxos de criação/edição/exclusão com feedback adequado e sincronização com URL para filtros e paginação.

## Requisitos Funcionais

- **RF01:** DataTable com TanStack Table: ordenação (server-side e client-side)
- **RF02:** Filtros compostos: texto, date range, select, multi-select
- **RF03:** Toggle de visibilidade de colunas
- **RF04:** Seleção de linhas + bulk actions (delete, export selecionados, etc.)
- **RF05:** Edição inline de células
- **RF06:** Virtualização para grandes datasets (TanStack Virtual)
- **RF07:** Listas e grids: infinite scroll, virtualized list, toggle grid/lista, empty state
- **RF08:** Exportação: CSV, Excel (xlsx), JSON, PDF; exportação parcial ou total com formatação
- **RF09:** Padrões CRUD: criar (modal ou página), editar, excluir com confirmação, optimistic updates, feedback
- **RF10:** Composição DataTable + Form + API + URL State para gestão completa de recursos

## Requisitos Não-Funcionais

- **RNF01:** Acessibilidade - tabela com roles ARIA, keyboard navigation, foco em modais
- **RNF02:** Performance - virtualização para 10k+ linhas, debounce em filtros
- **RNF03:** Responsividade - tabela scroll horizontal em mobile, layout adaptável
- **RNF04:** TypeScript - tipos genéricos para colunas e dados

## Design da API / Interface

### Tipos auxiliares e helpers

```tsx
// src/lib/data/types.ts

// Configuracao de coluna para exportacao
interface ColumnConfig<T> {
  key: keyof T;
  header: string;
  format?: (value: unknown) => string;
}

// Utilitario de download de arquivo
function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Helper para adicionar coluna de selecao
function withSelectionColumn<T>(
  columns: ColumnDef<T>[],
  rowSelection?: boolean
): ColumnDef<T>[] {
  if (!rowSelection) return columns;
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
    },
    ...columns,
  ];
}
```

### DataTable base com TanStack Table

```tsx
// src/components/shared/DataTable.tsx
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  sortable?: boolean;
  serverSort?: { field: string; dir: 'asc' | 'desc' };
  onSortChange?: (field: string, dir: 'asc' | 'desc') => void;
  filters?: FilterConfig[];
  rowSelection?: boolean;
  onBulkAction?: (selectedRows: TData[], action: string) => void;
}

export function DataTable<TData>({
  data,
  columns,
  sortable = true,
  serverSort,
  onSortChange,
  filters,
  rowSelection,
  onBulkAction,
}: DataTableProps<TData>) {
  const [rowSelectionState, setRowSelectionState] = useState<Record<string, boolean>>({});
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});

  const table = useReactTable({
    data,
    columns: withSelectionColumn(columns, rowSelection),
    state: {
      sorting: serverSort ? [{ id: serverSort.field, desc: serverSort.dir === 'desc' }] : undefined,
      rowSelection: rowSelectionState,
      columnVisibility,
    },
    onSortingChange: (updater) => {
      const next = updater([{ id: serverSort?.field ?? '', desc: false }]);
      onSortChange?.(next[0]?.id ?? '', next[0]?.desc ? 'desc' : 'asc');
    },
    onRowSelectionChange: setRowSelectionState,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: serverSort ? undefined : getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualSorting: !!serverSort,
    manualFiltering: !!filters?.length,
  });

  return (
    <div>
      {filters && <TableFilters filters={filters} table={table} />}
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="outline">Colunas</Button></DropdownMenuTrigger>
        <DropdownMenuContent>
          {table.getAllLeafColumns().map((col) => (
            <DropdownMenuCheckboxItem key={col.id} checked={col.getIsVisible()}
              onCheckedChange={(v) => col.toggleVisibility(!!v)}>
              {col.columnDef.header}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((h) => (
                <TableHead key={h.id} onClick={h.column.getCanSort() ? () => h.column.toggleSorting() : undefined}>
                  {flexRender(h.column.columnDef.header, h.getContext())}
                  {h.column.getIsSorted() && <ChevronUpDown />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {rowSelection && Object.keys(rowSelectionState).some(Boolean) && (
        <BulkActionBar
          count={Object.keys(rowSelectionState).filter(Boolean).length}
          onAction={(a) => onBulkAction?.(table.getSelectedRowModel().rows.map((r) => r.original), a)}
        />
      )}
    </div>
  );
}
```

### Filtros compostos

```tsx
// src/components/shared/TableFilters.tsx
interface FilterConfig {
  id: string;
  type: 'text' | 'dateRange' | 'select' | 'multiSelect';
  label: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

function TableFilters({ filters, table }: { filters: FilterConfig[]; table: Table<unknown> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => {
        switch (f.type) {
          case 'text':
            return (
              <Input
                key={f.id}
                placeholder={f.placeholder}
                value={(table.getColumn(f.id)?.getFilterValue() as string) ?? ''}
                onChange={(e) => table.getColumn(f.id)?.setFilterValue(e.target.value)}
              />
            );
          case 'select':
            return (
              <Select
                key={f.id}
                value={table.getColumn(f.id)?.getFilterValue() as string}
                onValueChange={(v) => table.getColumn(f.id)?.setFilterValue(v)}
              >
                <SelectTrigger><SelectValue placeholder={f.label} /></SelectTrigger>
                <SelectContent>
                  {f.options?.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            );
          case 'dateRange':
            return (
              <DateRangePicker
                key={f.id}
                value={table.getColumn(f.id)?.getFilterValue() as [Date, Date]}
                onChange={(range) => table.getColumn(f.id)?.setFilterValue(range)}
              />
            );
          case 'multiSelect':
            return (
              <MultiSelect
                key={f.id}
                options={f.options ?? []}
                value={(table.getColumn(f.id)?.getFilterValue() as string[]) ?? []}
                onChange={(values) => table.getColumn(f.id)?.setFilterValue(values)}
                placeholder={f.label}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
```

### Edição inline

```tsx
// Coluna editável
const editableColumn: ColumnDef<User> = {
  id: 'name',
  header: 'Nome',
  cell: ({ row, table }) => (
    <EditableCell
      value={row.original.name}
      onSave={(value) => table.options.meta?.onUpdateRow?.(row.original.id, { name: value })}
    />
  ),
};
```

### Virtualização

```tsx
// src/components/shared/VirtualizedDataTable.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualizedDataTable<TData>({ data, columns }: DataTableProps<TData>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
  });

  return (
    <div ref={parentRef} className="h-[500px] overflow-auto">
      <div style={{ height: rowVirtualizer.getTotalSize() }} className="relative">
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div key={virtualRow.key} className="absolute top-0 left-0 w-full" style={{ height: virtualRow.size, transform: `translateY(${virtualRow.start}px)` }}>
            {/* render row */}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Exportação

```tsx
// src/lib/data/export.ts
export async function exportToCsv<T>(data: T[], columns: { key: keyof T; label: string }[], filename: string) {
  const headers = columns.map((c) => c.label).join(',');
  const rows = data.map((row) => columns.map((c) => JSON.stringify(row[c.key])).join(','));
  const csv = [headers, ...rows].join('\n');
  downloadFile(new Blob([csv], { type: 'text/csv' }), `${filename}.csv`);
}

export async function exportToExcel<T>(data: T[], columns: ColumnConfig<T>[], filename: string) {
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.json_to_sheet(data.map((r) => objectFromColumns(r, columns)));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToJson<T>(data: T[], filename: string) {
  downloadFile(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), `${filename}.json`);
}

export async function exportToPdf<T>(data: T[], columns: ColumnConfig<T>[], filename: string) {
  const { jsPDF } = await import('jspdf');
  await import('jspdf-autotable');
  const doc = new jsPDF();
  // Usa jspdf-autotable para renderizar tabela no PDF
  (doc as any).autoTable({
    head: [columns.map((c) => c.header)],
    body: data.map((row) => columns.map((c) => c.format ? c.format(row[c.key]) : String(row[c.key]))),
  });
  doc.save(`${filename}.pdf`);
}
```

### Padrões CRUD e composição com URL State

```tsx
// src/components/features/users/UserListPage.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/shared/DataTable';
import { UserFormModal } from './UserFormModal';
import { deleteUser, fetchUsers } from '@/lib/api/users';

interface User {
  id: string;
  name: string;
  email: string;
}

export function UserListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const sort = searchParams.get('sort') ?? 'name';
  const dir = (searchParams.get('dir') as 'asc' | 'desc') ?? 'asc';
  const filters = Object.fromEntries(searchParams.entries());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['users', page, sort, dir, filters],
    queryFn: () => fetchUsers({ page, sort, dir, ...filters }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const prev = queryClient.getQueryData(['users', page, sort, dir, filters]);
      queryClient.setQueryData<{ items: User[] }>(
        ['users', page, sort, dir, filters],
        (old) => old ? { ...old, items: old.items.filter((u) => u.id !== userId) } : old
      );
      return { prev };
    },
    onError: (err, id, ctx) => queryClient.setQueryData(['users', page, sort, dir, filters], ctx?.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const handleDelete = (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = () => {
    if (deleteTarget) deleteMutation.mutate(deleteTarget);
    setDeleteTarget(null);
  };

  return (
    <>
      <Button onClick={() => { setEditingId(null); setModalOpen(true); }}>Novo usuário</Button>
      <DataTable
        data={data?.items ?? []}
        columns={userColumns({ onEdit: setEditingId, onDelete: handleDelete })}
        serverSort={{ field: sort, dir }}
        onSortChange={(f, d) => router.push(`?${new URLSearchParams({ ...Object.fromEntries(searchParams), sort: f, dir: d })}`)}
        filters={userFilters}
        rowSelection
        onBulkAction={(rows, action) => action === 'delete' && rows.forEach((r) => deleteMutation.mutate(r.id))}
      />
      <UserFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        userId={editingId}
        onSuccess={() => { setModalOpen(false); queryClient.invalidateQueries({ queryKey: ['users'] }); }}
      />
      {/* Usar componente ConfirmDialog da spec de Feedback & Orientação */}
      {/* Ver: ../f-padroes-ux/feedback-orientacao.md */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!deleteMutation.error} onOpenChange={() => deleteMutation.reset()}>
        <AlertDialogContent>
          <AlertDialogTitle>Erro ao excluir</AlertDialogTitle>
          <AlertDialogDescription>{deleteMutation.error?.message}</AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

### Infinite scroll e empty state

```tsx
// src/components/shared/InfiniteList.tsx
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

export function InfiniteList<T>({ queryKey, fetchFn, renderItem, emptyMessage }: InfiniteListProps<T>) {
  const { ref, inView } = useInView();
  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchFn(pageParam),
    getNextPageParam: (last) => last?.nextCursor,
    initialPageParam: undefined,
  });

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView, hasNextPage, fetchNextPage]);

  const items = data?.pages.flatMap((p) => p.items) ?? [];
  if (!isLoading && items.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <div>
      {items.map((item) => renderItem(item))}
      <div ref={ref} />
    </div>
  );
}
```

## Estrutura de Arquivos

```
src/
├── components/
│   ├── shared/
│   │   ├── DataTable.tsx
│   │   ├── VirtualizedDataTable.tsx
│   │   ├── TableFilters.tsx
│   │   ├── BulkActionBar.tsx
│   │   ├── EditableCell.tsx
│   │   ├── InfiniteList.tsx
│   │   ├── EmptyState.tsx
│   │   └── GridListViewToggle.tsx
│   └── features/
│       └── [resource]/
│           ├── [Resource]ListPage.tsx
│           ├── [Resource]FormModal.tsx
│           └── columns.ts
├── lib/
│   └── data/
│       ├── export.ts
│       └── types.ts
└── hooks/
    └── useDataTableState.ts    # Sync table state with URL
```

## Dependências

### Bibliotecas Externas

- `@tanstack/react-table` - DataTable, sorting, filtering, pagination
- `@tanstack/react-virtual` - virtualização de listas
- `@tanstack/react-query` - fetching, cache, optimistic updates
- `xlsx` - export Excel
- `jspdf` - export PDF
- `jspdf-autotable` - renderização de tabelas em PDF (plugin para jsPDF)
- `react-intersection-observer` - infinite scroll

### Specs Relacionados

- [Formulários](./formularios.md) - modais de criar/editar
- [Formatadores & Date/Time](./formatadores-datetime.md) - formatação de células
- [Cliente API & Erros](../c-api-servidor/cliente-api-erros.md) - React Query, interceptors
- [Navegação, URL & Busca](../d-navegacao/navegacao-url-busca.md) - URL state
- [Feedback & Orientação](../f-padroes-ux/feedback-orientacao.md) - toasts, confirmação, empty state

## Notas de Implementação

- O componente `ConfirmDialog` utilizado nos fluxos de exclusão é definido na spec de [Feedback & Orientação](../f-padroes-ux/feedback-orientacao.md).
- Os formatadores de célula (moeda, data, documentos) vêm da spec de [Formatadores & Date/Time](./formatadores-datetime.md).
- A sincronização de filtros/paginação com URL segue os hooks da spec de [Navegação, URL & Busca](../d-navegacao/navegacao-url-busca.md).

## Critérios de Aceite

- [ ] RF01: DataTable com ordenação client e server-side configurável
- [ ] RF02: Filtros text, dateRange, select, multiSelect implementados
- [ ] RF03: Toggle de colunas via dropdown
- [ ] RF04: Seleção de linhas e BulkActionBar com ações configuráveis
- [ ] RF05: EditableCell para edição inline com onSave
- [ ] RF06: VirtualizedDataTable renderiza 10.000 linhas com scroll a 60fps (medido via DevTools Performance)
- [ ] RF07: InfiniteList, GridListViewToggle e EmptyState
- [ ] RF08: Export CSV, Excel, JSON, PDF com formatação
- [ ] RF09: Fluxo CRUD completo: modal criar/editar, confirmação delete, optimistic update, toast
- [ ] RF10: Exemplo UserListPage com URL sync (page, sort, filters)
- [ ] Testes unitários para lógica de filtros/sort, testes de integração para fluxo CRUD completo
- [ ] Storybook com DataTable, filtros e export

## Referências

- [TanStack Table](https://tanstack.com/table/latest)
- [TanStack Virtual](https://tanstack.com/virtual/latest)
- [TanStack Query](https://tanstack.com/query/latest)
- [shadcn Table](https://ui.shadcn.com/docs/components/table)
- [SheetJS (xlsx)](https://sheetjs.com/)
- [jsPDF](https://github.com/parallax/jsPDF)
