import { hashPassword } from "../lib/hash";
import { logger } from "../lib/logger";
import { closeDatabase, db } from "./index";
import {
  featureFlags,
  permissions,
  rolePermissions,
  roles,
  users,
} from "./schema/index";

const log = logger.child({ module: "seed" });

// ---- Default permissions ----

const DEFAULT_PERMISSIONS = [
  // Users
  {
    key: "users.create",
    resource: "users",
    action: "create",
    description: "Create users",
  },
  {
    key: "users.read",
    resource: "users",
    action: "read",
    description: "View users",
  },
  {
    key: "users.update",
    resource: "users",
    action: "update",
    description: "Update users",
  },
  {
    key: "users.delete",
    resource: "users",
    action: "delete",
    description: "Delete users",
  },

  // Uploads
  {
    key: "uploads.create",
    resource: "uploads",
    action: "create",
    description: "Upload files",
  },
  {
    key: "uploads.read",
    resource: "uploads",
    action: "read",
    description: "View uploads",
  },
  {
    key: "uploads.delete",
    resource: "uploads",
    action: "delete",
    description: "Delete uploads",
  },

  // Audit
  {
    key: "audit.read",
    resource: "audit",
    action: "read",
    description: "View audit logs",
  },

  // Roles
  {
    key: "roles.create",
    resource: "roles",
    action: "create",
    description: "Create roles",
  },
  {
    key: "roles.read",
    resource: "roles",
    action: "read",
    description: "View roles",
  },
  {
    key: "roles.update",
    resource: "roles",
    action: "update",
    description: "Update roles",
  },
  {
    key: "roles.delete",
    resource: "roles",
    action: "delete",
    description: "Delete roles",
  },

  // Feature Flags
  {
    key: "feature-flags.create",
    resource: "feature-flags",
    action: "create",
    description: "Create feature flags",
  },
  {
    key: "feature-flags.read",
    resource: "feature-flags",
    action: "read",
    description: "View feature flags",
  },
  {
    key: "feature-flags.update",
    resource: "feature-flags",
    action: "update",
    description: "Update feature flags",
  },
  {
    key: "feature-flags.delete",
    resource: "feature-flags",
    action: "delete",
    description: "Delete feature flags",
  },

  // Settings
  {
    key: "settings.read",
    resource: "settings",
    action: "read",
    description: "View settings",
  },
  {
    key: "settings.update",
    resource: "settings",
    action: "update",
    description: "Update settings",
  },

  // Webhooks
  {
    key: "webhooks.create",
    resource: "webhooks",
    action: "create",
    description: "Create webhooks",
  },
  {
    key: "webhooks.read",
    resource: "webhooks",
    action: "read",
    description: "View webhooks",
  },
  {
    key: "webhooks.update",
    resource: "webhooks",
    action: "update",
    description: "Update webhooks",
  },
  {
    key: "webhooks.delete",
    resource: "webhooks",
    action: "delete",
    description: "Delete webhooks",
  },

  // Notifications
  {
    key: "notifications.read",
    resource: "notifications",
    action: "read",
    description: "View notifications",
  },

  // Sessions
  {
    key: "sessions.read",
    resource: "sessions",
    action: "read",
    description: "View sessions",
  },
  {
    key: "sessions.delete",
    resource: "sessions",
    action: "delete",
    description: "Revoke sessions",
  },
] as const;

// ---- Default feature flags ----

const DEFAULT_FEATURE_FLAGS = [
  {
    key: "social-login",
    description:
      "Enable social login (Google, GitHub, Apple) via Firebase Auth",
    enabled: false,
  },
  {
    key: "webhooks",
    description: "Enable webhook subscriptions for users",
    enabled: true,
  },
  {
    key: "api-keys",
    description: "Enable API key management for users",
    enabled: true,
  },
  {
    key: "notifications",
    description: "Enable in-app notification system",
    enabled: true,
  },
];

async function seed() {
  log.info("Starting database seed...");

  // ---- 1. Users ----

  const adminPassword = await hashPassword("password123");
  await db
    .insert(users)
    .values({
      name: "Admin",
      email: "admin@corestack.dev",
      passwordHash: adminPassword,
      role: "admin",
    })
    .onConflictDoNothing({ target: users.email });
  log.info({ email: "admin@corestack.dev", role: "admin" }, "Seeded user");

  const userPassword = await hashPassword("password123");
  await db
    .insert(users)
    .values({
      name: "Demo User",
      email: "demo@corestack.dev",
      passwordHash: userPassword,
      role: "user",
    })
    .onConflictDoNothing({ target: users.email });
  log.info({ email: "demo@corestack.dev", role: "user" }, "Seeded user");

  // ---- 2. Permissions ----

  for (const perm of DEFAULT_PERMISSIONS) {
    await db
      .insert(permissions)
      .values(perm)
      .onConflictDoNothing({ target: permissions.key });
  }
  log.info({ count: DEFAULT_PERMISSIONS.length }, "Seeded permissions");

  // ---- 3. Roles ----

  const adminRole = await db
    .insert(roles)
    .values({
      name: "admin",
      description: "Full system access",
      isSystem: true,
    })
    .onConflictDoNothing({ target: roles.name })
    .returning();
  log.info({ name: "admin" }, "Seeded role");

  const userRole = await db
    .insert(roles)
    .values({
      name: "user",
      description: "Standard user access",
      isSystem: true,
    })
    .onConflictDoNothing({ target: roles.name })
    .returning();
  log.info({ name: "user" }, "Seeded role");

  // ---- 4. Role-Permission assignments ----

  // Fetch all permissions from DB (to get their IDs)
  const allPermissions = await db.select().from(permissions);
  const permMap = new Map(allPermissions.map((p) => [p.key, p.id]));

  // Admin gets ALL permissions
  if (adminRole[0]) {
    for (const perm of allPermissions) {
      await db
        .insert(rolePermissions)
        .values({ roleId: adminRole[0].id, permissionId: perm.id })
        .onConflictDoNothing();
    }
    log.info("Assigned all permissions to admin role");
  }

  // User gets limited permissions
  if (userRole[0]) {
    const userPermKeys = [
      "uploads.create",
      "uploads.read",
      "notifications.read",
      "sessions.read",
      "sessions.delete",
      "webhooks.create",
      "webhooks.read",
      "webhooks.update",
      "webhooks.delete",
      "settings.read",
      "settings.update",
    ];

    for (const key of userPermKeys) {
      const permId = permMap.get(key);
      if (permId) {
        await db
          .insert(rolePermissions)
          .values({ roleId: userRole[0].id, permissionId: permId })
          .onConflictDoNothing();
      }
    }
    log.info("Assigned limited permissions to user role");
  }

  // ---- 5. Feature flags ----

  for (const flag of DEFAULT_FEATURE_FLAGS) {
    await db
      .insert(featureFlags)
      .values(flag)
      .onConflictDoNothing({ target: featureFlags.key });
  }
  log.info({ count: DEFAULT_FEATURE_FLAGS.length }, "Seeded feature flags");

  log.info("Seed complete");
  await closeDatabase();
}

seed().catch((err) => {
  log.fatal(err, "Seed failed");
  process.exit(1);
});
