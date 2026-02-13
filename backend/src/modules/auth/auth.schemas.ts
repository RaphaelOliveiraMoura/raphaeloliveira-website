import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  user: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    role: z.string(),
  }),
});

export const refreshResponseSchema = z.object({
  accessToken: z.string(),
});

export const meResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  createdAt: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;
