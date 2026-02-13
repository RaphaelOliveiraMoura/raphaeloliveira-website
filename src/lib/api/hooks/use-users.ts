import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";

import type {
  CreateUserPayload,
  ListUsersParams,
  UpdateUserPayload,
  UserResponse,
  UsersListResponse,
} from "@/types/api";

import { queryKeys } from "./query-keys";
import { buildQueryString } from "./utils";

export function useUsers(params?: ListUsersParams) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: async () => {
      const qs = buildQueryString(params);
      const { data } = await apiClient.get<UsersListResponse>(`/users${qs}`);
      return data;
    },
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<UserResponse>(`/users/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateUserPayload) => {
      const { data } = await apiClient.post<UserResponse>("/users", payload);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: UpdateUserPayload & { id: string }) => {
      const { data } = await apiClient.patch<UserResponse>(
        `/users/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/users/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useExportUsers(format: "csv" | "json") {
  return useQuery({
    queryKey: ["users", "export", format],
    queryFn: async () => {
      const { data } = await apiClient.get<Blob>(
        `/users/export?format=${format}`,
      );
      return data;
    },
    enabled: false,
  });
}
