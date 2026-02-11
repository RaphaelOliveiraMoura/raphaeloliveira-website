"use client";

import { useMemo } from "react";
import { useAuth } from "@/providers/auth-provider";
import { ROLE_PERMISSIONS, type Permission } from "@/types/auth";

export function usePermissions() {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user) return [];
    return ROLE_PERMISSIONS[user.role] ?? [];
  }, [user]);

  const can = (permission: Permission): boolean =>
    permissions.includes(permission);

  const canAny = (perms: Permission[]): boolean => perms.some((p) => can(p));
  const canAll = (perms: Permission[]): boolean => perms.every((p) => can(p));

  return { permissions, can, canAny, canAll };
}
