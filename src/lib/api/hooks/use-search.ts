import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";

import type { SearchParams, SearchResponse } from "@/types/api";

import { queryKeys } from "./query-keys";
import { buildQueryString } from "./utils";

export function useSearch(params: SearchParams) {
  return useQuery({
    queryKey: queryKeys.search.results(params),
    queryFn: async () => {
      const qs = buildQueryString(params);
      const { data } = await apiClient.get<SearchResponse>(`/search${qs}`);
      return data;
    },
    enabled: !!params.q && params.q.length >= 2,
  });
}
