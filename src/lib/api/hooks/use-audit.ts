import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";

import type { AuditLogsListResponse, ListAuditLogsParams } from "@/types/api";

import { queryKeys } from "./query-keys";
import { buildQueryString } from "./utils";

export function useAuditLogs(params?: ListAuditLogsParams) {
  return useQuery({
    queryKey: queryKeys.audit.list(params),
    queryFn: async () => {
      const qs = buildQueryString(params);
      const { data } = await apiClient.get<AuditLogsListResponse>(
        `/audit${qs}`,
      );
      return data;
    },
  });
}

export function useExportAuditLogs(format: "csv" | "json") {
  return useQuery({
    queryKey: ["audit", "export", format],
    queryFn: async () => {
      const { data } = await apiClient.get<Blob>(
        `/audit/export?format=${format}`,
      );
      return data;
    },
    enabled: false,
  });
}
