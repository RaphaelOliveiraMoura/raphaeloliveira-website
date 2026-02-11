"use client";

import { useFeatureFlag } from "@/hooks/use-feature-flag";

import type { FeatureFlagName } from "@/config/feature-flags";

interface FeatureProps {
  flag: FeatureFlagName;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Feature({ flag, children, fallback = null }: FeatureProps) {
  const enabled = useFeatureFlag(flag);
  return enabled ? <>{children}</> : <>{fallback}</>;
}
