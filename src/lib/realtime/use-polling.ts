"use client";

import {
  type QueryKey,
  type QueryFunction,
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

interface UsePollingOptions<TData, TError = Error>
  extends Omit<
    UseQueryOptions<TData, TError>,
    "queryKey" | "queryFn" | "refetchInterval"
  > {
  queryKey: QueryKey;
  queryFn: QueryFunction<TData>;
  interval: number;
}

/**
 * Wrapper around useQuery with refetchInterval for polling.
 * Returns the full query result from React Query.
 */
export function usePolling<TData, TError = Error>({
  queryKey,
  queryFn,
  interval,
  ...queryOptions
}: UsePollingOptions<TData, TError>): UseQueryResult<TData, TError> {
  return useQuery({
    queryKey,
    queryFn,
    refetchInterval: interval,
    ...queryOptions,
  });
}
