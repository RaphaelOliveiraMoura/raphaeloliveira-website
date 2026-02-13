import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";

import type {
  ApiKeysListResponse,
  CreateApiKeyPayload,
  CreateApiKeyResponse,
} from "@/types/api";

import { queryKeys } from "./query-keys";

export function useApiKeys() {
  return useQuery({
    queryKey: queryKeys.apiKeys.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiKeysListResponse>("/api-keys");
      return data;
    },
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateApiKeyPayload) => {
      const { data } = await apiClient.post<CreateApiKeyResponse>(
        "/api-keys",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.apiKeys.all,
      });
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api-keys/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.apiKeys.all,
      });
    },
  });
}
