import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(255).optional(),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(255).optional(),
});

export const setPermissionsSchema = z.object({
  permissionIds: z.array(z.string().uuid()),
});

export const roleResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  isSystem: z.boolean(),
  permissions: z.array(
    z.object({
      id: z.string().uuid(),
      key: z.string(),
      description: z.string().nullable(),
      resource: z.string(),
      action: z.string(),
    }),
  ),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const permissionResponseSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  description: z.string().nullable(),
  resource: z.string(),
  action: z.string(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
