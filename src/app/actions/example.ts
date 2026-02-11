"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

export async function createUser(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const result = createUserSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false as const,
      errors: result.error.flatten().fieldErrors,
    };
  }
  // Simulated insert
  revalidatePath("/dashboard/users");
  return {
    success: true as const,
    data: { id: crypto.randomUUID(), ...result.data },
  };
}
