import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url().optional(),
    JWT_SECRET: z.string().min(32).optional(),
    NEXTAUTH_SECRET: z.string().min(32).optional(),
    NEXTAUTH_URL: z.url().optional(),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.url().optional(),
    NEXT_PUBLIC_API_URL: z.url().optional(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
