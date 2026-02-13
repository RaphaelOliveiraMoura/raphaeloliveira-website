import { eq, inArray } from "drizzle-orm";

import { db } from "../../db/index";
import type { NewRole, Permission, Role } from "../../db/schema/rbac";
import { permissions, rolePermissions, roles } from "../../db/schema/rbac";

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export class RolesRepository {
  /**
   * Get all roles with their associated permissions.
   */
  async findAllWithPermissions(): Promise<RoleWithPermissions[]> {
    const allRoles = await db.select().from(roles);
    const allRolePermissions = await db.select().from(rolePermissions);
    const allPermissions = await db.select().from(permissions);

    const permMap = new Map(allPermissions.map((p) => [p.id, p]));

    return allRoles.map((role) => {
      const permIds = allRolePermissions
        .filter((rp) => rp.roleId === role.id)
        .map((rp) => rp.permissionId);

      return {
        ...role,
        permissions: permIds
          .map((id) => permMap.get(id))
          .filter((p): p is Permission => p !== undefined),
      };
    });
  }

  /**
   * Get a role by ID with its permissions.
   */
  async findByIdWithPermissions(
    id: string,
  ): Promise<RoleWithPermissions | undefined> {
    const [role] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);
    if (!role) return undefined;

    const rps = await db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, id));

    const permIds = rps.map((rp) => rp.permissionId);
    const perms =
      permIds.length > 0
        ? await db
            .select()
            .from(permissions)
            .where(inArray(permissions.id, permIds))
        : [];

    return { ...role, permissions: perms };
  }

  /**
   * Get a role by name with its permissions.
   */
  async findByNameWithPermissions(
    name: string,
  ): Promise<RoleWithPermissions | undefined> {
    const [role] = await db
      .select()
      .from(roles)
      .where(eq(roles.name, name))
      .limit(1);
    if (!role) return undefined;

    return this.findByIdWithPermissions(role.id);
  }

  /**
   * Create a new role.
   */
  async create(data: NewRole): Promise<Role> {
    const [role] = await db.insert(roles).values(data).returning();
    return role!;
  }

  /**
   * Update a role by ID.
   */
  async update(
    id: string,
    data: Partial<Pick<Role, "name" | "description">>,
  ): Promise<Role | undefined> {
    const [role] = await db
      .update(roles)
      .set(data)
      .where(eq(roles.id, id))
      .returning();
    return role;
  }

  /**
   * Delete a role by ID.
   */
  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(roles)
      .where(eq(roles.id, id))
      .returning({ id: roles.id });
    return result.length > 0;
  }

  /**
   * Set the permissions for a role (replace all).
   */
  async setPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    // Remove all existing permissions
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

    // Insert new permissions
    if (permissionIds.length > 0) {
      await db.insert(rolePermissions).values(
        permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      );
    }
  }

  /**
   * Get all permissions.
   */
  async findAllPermissions(): Promise<Permission[]> {
    return db.select().from(permissions);
  }

  /**
   * Get permission keys for a role by name.
   */
  async getPermissionKeysByRoleName(roleName: string): Promise<string[]> {
    const role = await this.findByNameWithPermissions(roleName);
    if (!role) return [];
    return role.permissions.map((p) => p.key);
  }
}
