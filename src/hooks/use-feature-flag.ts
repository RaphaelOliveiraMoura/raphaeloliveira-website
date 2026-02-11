"use client";

import { useMemo } from "react";

import { getFeatureFlagValue } from "@/lib/feature-flags";

import type { FeatureFlagName } from "@/config/feature-flags";

export function useFeatureFlag(flagName: FeatureFlagName): boolean {
  return useMemo(() => getFeatureFlagValue(flagName), [flagName]);
}
