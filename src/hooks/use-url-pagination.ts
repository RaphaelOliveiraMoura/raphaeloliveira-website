"use client";

import { useUrlState } from "@/hooks/use-url-state";

export function useUrlPagination(defaultPageSize = 20) {
  const [page, setPage] = useUrlState<string>("page", "1");
  const [pageSize, setPageSize] = useUrlState<string>(
    "pageSize",
    String(defaultPageSize)
  );
  const [sortBy, setSortBy] = useUrlState<string>("sortBy");
  const [sortOrder, setSortOrder] = useUrlState<"asc" | "desc">(
    "sortOrder",
    "asc"
  );

  return {
    page: Number(page) || 1,
    pageSize: Number(pageSize) || defaultPageSize,
    sortBy: sortBy || undefined,
    sortOrder: sortOrder || "asc",
    setPage: (p: number) => setPage(String(p)),
    setPageSize: (s: number) => setPageSize(String(s)),
    setSortBy,
    setSortOrder,
    setSort: (by: string, order: "asc" | "desc") => {
      setSortBy(by);
      setSortOrder(order);
    },
  };
}
