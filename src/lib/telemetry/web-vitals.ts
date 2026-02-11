import type { Metric } from "web-vitals";

import { logger } from "@/lib/telemetry/logger";

export function reportWebVitals(metric: Metric): void {
  const body = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  };

  if (process.env.NODE_ENV === "development") {
    logger.info("[WebVitals]", body);
    return;
  }

  // In production, send to analytics endpoint
  // navigator.sendBeacon('/api/vitals', JSON.stringify(body));
}
