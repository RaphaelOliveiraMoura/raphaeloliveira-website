import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";

import type {
  ListNotificationsParams,
  NotificationPreference,
  NotificationsListResponse,
  UnreadCountResponse,
} from "@/types/api";

import { queryKeys } from "./query-keys";
import { buildQueryString } from "./utils";

export function useNotifications(params?: ListNotificationsParams) {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: async () => {
      const qs = buildQueryString(params);
      const { data } = await apiClient.get<NotificationsListResponse>(
        `/notifications${qs}`,
      );
      return data;
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const { data } = await apiClient.get<UnreadCountResponse>(
        "/notifications/unread-count",
      );
      return data;
    },
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.post("/notifications/read-all");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/notifications/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
    },
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: queryKeys.notifications.preferences(),
    queryFn: async () => {
      const { data } = await apiClient.get<NotificationPreference[]>(
        "/notifications/preferences",
      );
      return data;
    },
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (preferences: NotificationPreference[]) => {
      const { data } = await apiClient.put<NotificationPreference[]>(
        "/notifications/preferences",
        preferences,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.preferences(),
      });
    },
  });
}
