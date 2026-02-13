import { z } from "zod";

const envSchema = z.object({
  // Server
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default("0.0.0.0"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRATION: z.string().default("15m"),
  JWT_REFRESH_EXPIRATION: z.string().default("7d"),

  // CORS
  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  // Rate Limiting
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),

  // Logging
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.format();
    const errors = Object.entries(formatted)
      .filter(([key]) => key !== "_errors")
      .map(([key, value]) => {
        const messages =
          value && typeof value === "object" && "_errors" in value
            ? (value as { _errors: string[] })._errors.join(", ")
            : String(value);
        return `  ${key}: ${messages}`;
      })
      .join("\n");

    console.error("❌ Invalid environment variables:\n" + errors);
    process.exit(1);
  }

  return parsed.data;
}

export const env = loadEnv();

export type Env = z.infer<typeof envSchema>;
