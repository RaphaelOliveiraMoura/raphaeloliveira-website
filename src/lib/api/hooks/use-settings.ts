import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";

import type { SettingResponse, UpdateSettingPayload } from "@/types/api";

import { queryKeys } from "./query-keys";

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings.user(),
    queryFn: async () => {
      const { data } = await apiClient.get<SettingResponse[]>("/settings");
      return data;
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: UpdateSettingPayload[]) => {
      const { data } = await apiClient.put<SettingResponse[]>(
        "/settings",
        settings,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.settings.all,
      });
    },
  });
}

export function useSystemSettings() {
  return useQuery({
    queryKey: queryKeys.settings.system(),
    queryFn: async () => {
      const { data } =
        await apiClient.get<SettingResponse[]>("/settings/system");
      return data;
    },
  });
}

export function useUpdateSystemSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: UpdateSettingPayload[]) => {
      const { data } = await apiClient.put<SettingResponse[]>(
        "/settings/system",
        settings,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.settings.all,
      });
    },
  });
}
