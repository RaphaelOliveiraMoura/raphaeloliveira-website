"use client";

import { usePermissions } from "@/hooks/use-permissions";
import type { Permission } from "@/types/auth";

interface CanProps {
  permission: Permission | Permission[];
  mode?: "any" | "all";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Can({
  permission,
  mode = "any",
  children,
  fallback = null,
}: CanProps) {
  const { can, canAny, canAll } = usePermissions();

  const allowed = Array.isArray(permission)
    ? mode === "all"
      ? canAll(permission)
      : canAny(permission)
    : can(permission);

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
