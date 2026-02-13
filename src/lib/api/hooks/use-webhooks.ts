import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";

import type {
  CreateWebhookPayload,
  CreateWebhookResponse,
  PaginationParams,
  UpdateWebhookPayload,
  WebhookDeliveriesListResponse,
  WebhookResponse,
} from "@/types/api";

import { queryKeys } from "./query-keys";
import { buildQueryString } from "./utils";

export function useWebhooks() {
  return useQuery({
    queryKey: queryKeys.webhooks.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<WebhookResponse[]>("/webhooks");
      return data;
    },
  });
}

export function useCreateWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateWebhookPayload) => {
      const { data } = await apiClient.post<CreateWebhookResponse>(
        "/webhooks",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.webhooks.all,
      });
    },
  });
}

export function useUpdateWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: UpdateWebhookPayload & { id: string }) => {
      const { data } = await apiClient.patch<WebhookResponse>(
        `/webhooks/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.webhooks.all,
      });
    },
  });
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/webhooks/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.webhooks.all,
      });
    },
  });
}

export function useWebhookDeliveries(id: string, params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.webhooks.deliveries(id, params),
    queryFn: async () => {
      const qs = buildQueryString(params);
      const { data } = await apiClient.get<WebhookDeliveriesListResponse>(
        `/webhooks/${id}/deliveries${qs}`,
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useTestWebhook() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<{ success: boolean }>(
        `/webhooks/${id}/test`,
      );
      return data;
    },
  });
}
