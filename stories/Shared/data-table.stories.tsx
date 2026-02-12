import * as React from "react";
import { NextIntlClientProvider } from "next-intl";

import type { Meta, StoryObj } from "@storybook/react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";

import commonMessages from "../../messages/en/common.json";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
}

const MOCK_USERS: User[] = Array.from({ length: 25 }, (_, i) => ({
  id: String(i + 1),
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 3 === 0 ? "Admin" : i % 3 === 1 ? "Editor" : "Viewer",
  status: i % 4 === 0 ? "inactive" : "active",
}));

const columns: ColumnDef<User>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === "active" ? "default" : "secondary"}
      >
        {row.original.status}
      </Badge>
    ),
  },
];

const meta = {
  title: "Shared/DataTable",
  component: DataTable,
  parameters: {
    docs: {
      description: {
        component:
          "Tabela de dados avancada baseada em TanStack Table. Suporta paginacao manual/automatica, ordenacao, selecao de linhas e bulk actions.",
      },
    },
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="en" messages={{ common: commonMessages }}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
} satisfies Meta<typeof DataTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DataTable columns={columns} data={MOCK_USERS.slice(0, 10)} />,
};

function PaginationDemo() {
  const [page, setPage] = React.useState(1);
  const pageSize = 5;
  const total = MOCK_USERS.length;
  const data = MOCK_USERS.slice((page - 1) * pageSize, page * pageSize);
  return (
    <DataTable
      columns={columns}
      data={data}
      pagination={{ page, pageSize, total, onPageChange: setPage }}
    />
  );
}

export const WithPagination: Story = {
  name: "Com Paginacao",
  render: () => <PaginationDemo />,
};

export const WithRowSelection: Story = {
  name: "Com Selecao de Linhas",
  render: () => (
    <DataTable
      columns={columns}
      data={MOCK_USERS.slice(0, 8)}
      rowSelection
      bulkActions={[
        {
          label: "Delete selected",
          variant: "destructive",
          onClick: (rows) => alert(`Deleting ${rows.length} rows`),
        },
        {
          label: "Export selected",
          onClick: (rows) => alert(`Exporting ${rows.length} rows`),
        },
      ]}
    />
  ),
};
