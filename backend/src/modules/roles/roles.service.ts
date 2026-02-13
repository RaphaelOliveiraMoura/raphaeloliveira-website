import { container } from "../../lib/container";
import { ConflictError, ForbiddenError, NotFoundError } from "../../lib/errors";
import { logger } from "../../lib/logger";
import type { CacheProvider } from "../../services/cache/cache.port";
import type { RoleWithPermissions } from "./roles.repository";
import { RolesRepository } from "./roles.repository";
import type { CreateRoleInput, UpdateRoleInput } from "./roles.schemas";

const log = logger.child({ module: "roles" });

/** Cache TTL for role permissions (5 minutes). */
const CACHE_TTL = 300;

export class RolesService {
  private repository = new RolesRepository();

  private getCache(): CacheProvider | null {
    try {
      return container.resolve("cache");
    } catch {
      return null;
    }
  }

  /**
   * Get all roles with their permissions.
   */
  async listRoles(): Promise<RoleWithPermissions[]> {
    return this.repository.findAllWithPermissions();
  }

  /**
   * Create a new custom role.
   */
  async createRole(input: CreateRoleInput): Promise<RoleWithPermissions> {
    const existing = await this.repository.findByNameWithPermissions(
      input.name,
    );
    if (existing) {
      throw new ConflictError("Role", "name");
    }

    const role = await this.repository.create({
      name: input.name,
      description: input.description,
      isSystem: false,
    });

    return { ...role, permissions: [] };
  }

  /**
   * Update a role.
   */
  async updateRole(
    id: string,
    input: UpdateRoleInput,
  ): Promise<RoleWithPermissions> {
    const existing = await this.repository.findByIdWithPermissions(id);
    if (!existing) throw new NotFoundError("Role", id);

    if (existing.isSystem && input.name && input.name !== existing.name) {
      throw new ForbiddenError("Cannot rename a system role");
    }

    const updated = await this.repository.update(id, input);
    if (!updated) throw new NotFoundError("Role", id);

    await this.invalidateCache(updated.name);

    return { ...updated, permissions: existing.permissions };
  }

  /**
   * Delete a role (only non-system roles).
   */
  async deleteRole(id: string): Promise<void> {
    const existing = await this.repository.findByIdWithPermissions(id);
    if (!existing) throw new NotFoundError("Role", id);

    if (existing.isSystem) {
      throw new ForbiddenError("Cannot delete a system role");
    }

    await this.repository.delete(id);
    await this.invalidateCache(existing.name);
  }

  /**
   * Set the permissions for a role.
   */
  async setPermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<RoleWithPermissions> {
    const role = await this.repository.findByIdWithPermissions(roleId);
    if (!role) throw new NotFoundError("Role", roleId);

    await this.repository.setPermissions(roleId, permissionIds);
    await this.invalidateCache(role.name);

    // Refetch to return updated permissions
    const updated = await this.repository.findByIdWithPermissions(roleId);
    return updated!;
  }

  /**
   * Get all available permissions.
   */
  async listPermissions() {
    return this.repository.findAllPermissions();
  }

  /**
   * Get permission keys for a role (with cache).
   */
  async getPermissionKeys(roleName: string): Promise<string[]> {
    const cache = this.getCache();
    const cacheKey = `rbac:role:${roleName}:permissions`;

    if (cache) {
      const cached = await cache.get<string[]>(cacheKey);
      if (cached) return cached;
    }

    const keys = await this.repository.getPermissionKeysByRoleName(roleName);

    if (cache) {
      await cache.set(cacheKey, keys, CACHE_TTL);
    }

    return keys;
  }

  private async invalidateCache(roleName: string): Promise<void> {
    const cache = this.getCache();
    if (cache) {
      await cache.del(`rbac:role:${roleName}:permissions`);
      log.debug({ roleName }, "RBAC cache invalidated");
    }
  }
}
