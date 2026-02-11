import {
  type Permission,
  type Role,
  ROLE_PERMISSIONS,
  type User,
} from "@/types/auth";

/**
 * Verifica se um role possui determinada permissao.
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Verifica se um role possui TODAS as permissoes listadas.
 */
export function hasAllPermissions(
  role: Role,
  permissions: Permission[],
): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Verifica se um role possui PELO MENOS UMA das permissoes listadas.
 */
export function hasAnyPermission(
  role: Role,
  permissions: Permission[],
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Retorna as permissoes de um usuario (ou array vazio se nao autenticado).
 */
export function getUserPermissions(user: User | null): Permission[] {
  if (!user) return [];
  return ROLE_PERMISSIONS[user.role];
}
