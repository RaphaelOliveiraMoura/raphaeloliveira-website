import { z } from "zod";

const flagConditionsSchema = z
  .object({
    roles: z.array(z.string()).optional(),
    userIds: z.array(z.string().uuid()).optional(),
    percentage: z.number().min(0).max(100).optional(),
    environments: z.array(z.string()).optional(),
  })
  .optional()
  .nullable();

export const createFeatureFlagSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9._-]+$/, {
      message:
        "Key must be lowercase alphanumeric with dots, hyphens, or underscores",
    }),
  description: z.string().max(500).optional(),
  enabled: z.boolean().default(false),
  conditions: flagConditionsSchema,
});

export const updateFeatureFlagSchema = z.object({
  description: z.string().max(500).optional(),
  enabled: z.boolean().optional(),
  conditions: flagConditionsSchema,
});

export const featureFlagResponseSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  description: z.string().nullable(),
  enabled: z.boolean(),
  conditions: z
    .object({
      roles: z.array(z.string()).optional(),
      userIds: z.array(z.string()).optional(),
      percentage: z.number().optional(),
      environments: z.array(z.string()).optional(),
    })
    .nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const evaluateFlagsResponseSchema = z.record(z.string(), z.boolean());

export type CreateFeatureFlagInput = z.infer<typeof createFeatureFlagSchema>;
export type UpdateFeatureFlagInput = z.infer<typeof updateFeatureFlagSchema>;
