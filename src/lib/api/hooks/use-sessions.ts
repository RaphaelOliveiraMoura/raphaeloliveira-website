import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";

import type { SessionsListResponse } from "@/types/api";

import { queryKeys } from "./query-keys";

export function useSessions() {
  return useQuery({
    queryKey: queryKeys.sessions.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<SessionsListResponse>("/sessions");
      return data;
    },
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/sessions/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.all,
      });
    },
  });
}

export function useRevokeAllSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.delete("/sessions");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.all,
      });
    },
  });
}
