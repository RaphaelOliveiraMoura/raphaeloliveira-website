import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";

import type {
  ListUploadsParams,
  UploadResponse,
  UploadsListResponse,
} from "@/types/api";

import { queryKeys } from "./query-keys";
import { buildQueryString } from "./utils";

export function useUploads(params?: ListUploadsParams) {
  return useQuery({
    queryKey: queryKeys.uploads.list(params),
    queryFn: async () => {
      const qs = buildQueryString(params);
      const { data } = await apiClient.get<UploadsListResponse>(
        `/uploads${qs}`,
      );
      return data;
    },
  });
}

export function useUpload(id: string) {
  return useQuery({
    queryKey: queryKeys.uploads.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<UploadResponse>(`/uploads/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await apiClient.request<UploadResponse>("/uploads", {
        method: "POST",
        body: formData,
        // Nao enviar Content-Type - o browser seta com boundary
      });
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.uploads.all,
      });
    },
  });
}

export function useDeleteUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/uploads/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.uploads.all,
      });
    },
  });
}
