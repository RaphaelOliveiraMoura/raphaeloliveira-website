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

// ---- Password Reset ----

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6).max(128),
});

// ---- Email Verification ----

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

// ---- Social Login ----

export const socialLoginSchema = z.object({
  idToken: z.string().min(1),
  provider: z.enum(["google", "github", "apple", "facebook", "twitter"]),
});

export const socialLoginResponseSchema = z.object({
  accessToken: z.string(),
  user: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    role: z.string(),
    avatarUrl: z.string().nullable(),
    provider: z.string(),
  }),
});

// ---- Inferred types ----

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type SocialLoginInput = z.infer<typeof socialLoginSchema>;
