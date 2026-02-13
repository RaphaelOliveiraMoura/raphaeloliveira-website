import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";

import type {
  CreateRolePayload,
  PermissionResponse,
  RoleResponse,
  SetPermissionsPayload,
  UpdateRolePayload,
} from "@/types/api";

import { queryKeys } from "./query-keys";

export function useRoles() {
  return useQuery({
    queryKey: queryKeys.roles.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<RoleResponse[]>("/roles");
      return data;
    },
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: queryKeys.roles.permissions(),
    queryFn: async () => {
      const { data } =
        await apiClient.get<PermissionResponse[]>("/roles/permissions");
      return data;
    },
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateRolePayload) => {
      const { data } = await apiClient.post<RoleResponse>("/roles", payload);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: UpdateRolePayload & { id: string }) => {
      const { data } = await apiClient.patch<RoleResponse>(
        `/roles/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/roles/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
    },
  });
}

export function useSetRolePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: SetPermissionsPayload & { id: string }) => {
      const { data } = await apiClient.put<RoleResponse>(
        `/roles/${id}/permissions`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
    },
  });
}
