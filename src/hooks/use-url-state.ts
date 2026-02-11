"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useUrlState<T extends string>(
  key: string,
  defaultValue?: T
): [T, (value: T | undefined) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value =
    (searchParams.get(key) as T) ?? (defaultValue ?? ("" as T));

  const setValue = useCallback(
    (newValue: T | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newValue === undefined || newValue === "") {
        params.delete(key);
      } else {
        params.set(key, String(newValue));
      }
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [key, router, pathname, searchParams]
  );

  return [value, setValue];
}
