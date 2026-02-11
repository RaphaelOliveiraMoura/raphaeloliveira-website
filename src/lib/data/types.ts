import type React from "react";

export interface ColumnConfig<T> {
  id: string;
  header: string;
  accessorKey?: keyof T & string;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  cell?: (value: T) => React.ReactNode;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: "text" | "select" | "dateRange" | "multiSelect";
  options?: { label: string; value: string }[];
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}
