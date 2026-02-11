import {
  type Environment,
  type FeatureFlagConfig,
  type FeatureFlagName,
  featureFlags,
} from "@/config/feature-flags";

function getCurrentEnvironment(): Environment {
  if (process.env.NODE_ENV === "development") return "development";
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "preview") return "staging";
  return "production";
}

export function getFeatureFlagValue(flagName: FeatureFlagName): boolean {
  const config: FeatureFlagConfig = featureFlags[flagName];
  if (!config) return false;

  // Check environment override
  const env = getCurrentEnvironment();
  if (config.environments?.[env] !== undefined) {
    return config.environments[env]!;
  }

  // Check rollout percentage
  if (config.rolloutPercentage !== undefined) {
    const hash = flagName
      .split("")
      .reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return hash % 100 < config.rolloutPercentage;
  }

  return config.defaultValue;
}
