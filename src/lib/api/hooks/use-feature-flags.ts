import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";

import type {
  CreateFeatureFlagPayload,
  EvaluateFlagsResponse,
  FeatureFlagResponse,
  UpdateFeatureFlagPayload,
} from "@/types/api";

import { queryKeys } from "./query-keys";

export function useFeatureFlags() {
  return useQuery({
    queryKey: queryKeys.featureFlags.list(),
    queryFn: async () => {
      const { data } =
        await apiClient.get<FeatureFlagResponse[]>("/feature-flags");
      return data;
    },
  });
}

export function useEvaluateFlags() {
  return useQuery({
    queryKey: queryKeys.featureFlags.evaluate(),
    queryFn: async () => {
      const { data } = await apiClient.get<EvaluateFlagsResponse>(
        "/feature-flags/evaluate",
      );
      return data;
    },
  });
}

export function useCreateFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateFeatureFlagPayload) => {
      const { data } = await apiClient.post<FeatureFlagResponse>(
        "/feature-flags",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.featureFlags.all,
      });
    },
  });
}

export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: UpdateFeatureFlagPayload & { id: string }) => {
      const { data } = await apiClient.patch<FeatureFlagResponse>(
        `/feature-flags/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.featureFlags.all,
      });
    },
  });
}

export function useDeleteFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/feature-flags/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.featureFlags.all,
      });
    },
  });
}
