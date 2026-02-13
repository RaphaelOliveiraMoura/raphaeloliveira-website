import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";

import type {
  CreateFeedbackPayload,
  CreateFeedbackResponsePayload,
  FeedbackDetailResponse,
  FeedbackListResponse,
  FeedbackResponse,
  FeedbackResponseItem,
  FeedbackStatsResponse,
  ListFeedbackParams,
  UpdateFeedbackPayload,
} from "@/types/api";

import { queryKeys } from "./query-keys";
import { buildQueryString } from "./utils";

export function useFeedbackList(params?: ListFeedbackParams) {
  return useQuery({
    queryKey: queryKeys.feedback.list(params),
    queryFn: async () => {
      const qs = buildQueryString(params);
      const { data } = await apiClient.get<FeedbackListResponse>(
        `/feedback${qs}`,
      );
      return data;
    },
  });
}

export function useFeedbackDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.feedback.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<FeedbackDetailResponse>(
        `/feedback/${id}`,
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useFeedbackStats() {
  return useQuery({
    queryKey: queryKeys.feedback.stats(),
    queryFn: async () => {
      const { data } =
        await apiClient.get<FeedbackStatsResponse>("/feedback/stats");
      return data;
    },
  });
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateFeedbackPayload) => {
      const { data } = await apiClient.post<FeedbackResponse>(
        "/feedback",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.feedback.all,
      });
    },
  });
}

export function useUpdateFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: UpdateFeedbackPayload & { id: string }) => {
      const { data } = await apiClient.patch<FeedbackResponse>(
        `/feedback/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.feedback.all,
      });
    },
  });
}

export function useDeleteFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/feedback/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.feedback.all,
      });
    },
  });
}

export function useAddFeedbackResponse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      feedbackId,
      ...payload
    }: CreateFeedbackResponsePayload & { feedbackId: string }) => {
      const { data } = await apiClient.post<FeedbackResponseItem>(
        `/feedback/${feedbackId}/responses`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.feedback.all,
      });
    },
  });
}

export function useVoteFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (feedbackId: string) => {
      const { data } = await apiClient.post<{ voted: boolean }>(
        `/feedback/${feedbackId}/vote`,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.feedback.all,
      });
    },
  });
}
