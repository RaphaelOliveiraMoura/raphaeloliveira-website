import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";

import type {
  HealthResponse,
  LivenessResponse,
  ReadinessResponse,
} from "@/types/api";

import { queryKeys } from "./query-keys";

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health.status(),
    queryFn: async () => {
      const { data } = await apiClient.get<HealthResponse>("/health");
      return data;
    },
    refetchInterval: 60_000,
  });
}

export function useLiveness() {
  return useQuery({
    queryKey: queryKeys.health.live(),
    queryFn: async () => {
      const { data } = await apiClient.get<LivenessResponse>("/health/live");
      return data;
    },
  });
}

export function useReadiness() {
  return useQuery({
    queryKey: queryKeys.health.ready(),
    queryFn: async () => {
      const { data } = await apiClient.get<ReadinessResponse>("/health/ready");
      return data;
    },
  });
}
