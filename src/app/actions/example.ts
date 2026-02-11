"use server";

import { revalidatePath } from "next/cache";

import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
});

export async function createUser(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const result = createUserSchema.safeParse(raw);
  if (!result.success) {
    const tree = z.treeifyError(result.error);
    return {
      success: false as const,
      errors: Object.fromEntries(
        Object.entries(tree.properties ?? {}).map(([key, value]) => [
          key,
          value?.errors ?? [],
        ]),
      ),
    };
  }
  // Simulated insert
  revalidatePath("/dashboard/users");
  return {
    success: true as const,
    data: { id: crypto.randomUUID(), ...result.data },
  };
}
