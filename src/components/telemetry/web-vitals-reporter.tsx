"use client";

import { useEffect } from "react";
import { reportWebVitals } from "@/lib/telemetry/web-vitals";

export function WebVitalsReporter() {
  useEffect(() => {
    void import("web-vitals").then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
      onCLS(reportWebVitals);
      onFCP(reportWebVitals);
      onINP(reportWebVitals);
      onLCP(reportWebVitals);
      onTTFB(reportWebVitals);
    });
  }, []);

  return null;
}
