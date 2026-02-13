import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url().optional(),
    JWT_SECRET: z.string().min(32).optional(),
    API_INTERNAL_URL: z.url().optional(),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.url().optional(),
    NEXT_PUBLIC_API_URL: z.url().optional(),
    NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    API_INTERNAL_URL: process.env.API_INTERNAL_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
