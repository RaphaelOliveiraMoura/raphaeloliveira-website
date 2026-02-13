import { z } from "zod";

export const settingEntrySchema = z.object({
  key: z.string().min(1).max(100),
  value: z.unknown(),
});

export const updateSettingsSchema = z.array(settingEntrySchema);

export const settingResponseSchema = z.object({
  key: z.string(),
  value: z.unknown(),
  source: z.enum(["system", "user"]),
  updatedAt: z.string(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
