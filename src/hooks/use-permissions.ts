"use client";

import { useMemo } from "react";

import { type Permission, ROLE_PERMISSIONS } from "@/types/auth";

import { useAuth } from "@/providers/auth-provider";

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
