import { logger } from "@/lib/telemetry/logger";

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
}

const PII_KEYS = [
  "email",
  "password",
  "cpf",
  "cnpj",
  "phone",
  "token",
  "secret",
];

function filterPii(data: Record<string, unknown>): Record<string, unknown> {
  const filtered = { ...data };
  for (const key of Object.keys(filtered)) {
    if (PII_KEYS.some((pii) => key.toLowerCase().includes(pii))) {
      filtered[key] = "[REDACTED]";
    }
  }
  return filtered;
}

export function track(event: AnalyticsEvent): void {
  const safe = event.properties ? filterPii(event.properties) : {};
  if (process.env.NODE_ENV === "development") {
    logger.info("[Analytics]", { event: event.name, ...safe });
    return;
  }
  // In production, send to analytics provider
  // e.g., posthog.capture(event.name, safe);
}

export type { AnalyticsEvent };
