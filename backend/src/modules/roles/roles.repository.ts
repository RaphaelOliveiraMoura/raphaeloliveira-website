import { eq } from "drizzle-orm";

import { db } from "../../db/index";
import type { NewRole, Permission, Role } from "../../db/schema/rbac";
import { permissions, rolePermissions, roles } from "../../db/schema/rbac";

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export class RolesRepository {
  /**
   * Get all roles with their associated permissions using a single JOIN query.
   */
  async findAllWithPermissions(): Promise<RoleWithPermissions[]> {
    const rows = await db
      .select({
        // Role fields
        id: roles.id,
        name: roles.name,
        description: roles.description,
        isSystem: roles.isSystem,
        createdAt: roles.createdAt,
        updatedAt: roles.updatedAt,
        // Permission fields (nullable due to LEFT JOIN)
        permId: permissions.id,
        permKey: permissions.key,
        permDescription: permissions.description,
        permResource: permissions.resource,
        permAction: permissions.action,
        permCreatedAt: permissions.createdAt,
      })
      .from(roles)
      .leftJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
      .leftJoin(permissions, eq(permissions.id, rolePermissions.permissionId));

    // Group flattened rows into roles with permissions arrays
    const roleMap = new Map<string, RoleWithPermissions>();

    for (const row of rows) {
      if (!roleMap.has(row.id)) {
        roleMap.set(row.id, {
          id: row.id,
          name: row.name,
          description: row.description,
          isSystem: row.isSystem,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          permissions: [],
        });
      }

      // Add permission if it exists (LEFT JOIN may produce null)
      if (row.permId) {
        const role = roleMap.get(row.id)!;
        // Avoid duplicates
        if (!role.permissions.some((p) => p.id === row.permId)) {
          role.permissions.push({
            id: row.permId,
            key: row.permKey!,
            description: row.permDescription ?? null,
            resource: row.permResource!,
            action: row.permAction!,
            createdAt: row.permCreatedAt!,
          });
        }
      }
    }

    return Array.from(roleMap.values());
  }

  /**
   * Get a role by ID with its permissions using a single JOIN query.
   */
  async findByIdWithPermissions(
    id: string,
  ): Promise<RoleWithPermissions | undefined> {
    const rows = await db
      .select({
        id: roles.id,
        name: roles.name,
        description: roles.description,
        isSystem: roles.isSystem,
        createdAt: roles.createdAt,
        updatedAt: roles.updatedAt,
        permId: permissions.id,
        permKey: permissions.key,
        permDescription: permissions.description,
        permResource: permissions.resource,
        permAction: permissions.action,
        permCreatedAt: permissions.createdAt,
      })
      .from(roles)
      .leftJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
      .leftJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
      .where(eq(roles.id, id));

    if (rows.length === 0) return undefined;

    const first = rows[0]!;
    const role: RoleWithPermissions = {
      id: first.id,
      name: first.name,
      description: first.description,
      isSystem: first.isSystem,
      createdAt: first.createdAt,
      updatedAt: first.updatedAt,
      permissions: [],
    };

    for (const row of rows) {
      if (row.permId) {
        role.permissions.push({
          id: row.permId,
          key: row.permKey!,
          description: row.permDescription ?? null,
          resource: row.permResource!,
          action: row.permAction!,
          createdAt: row.permCreatedAt!,
        });
      }
    }

    return role;
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
