export type Environment = "development" | "staging" | "production";

export interface FeatureFlagConfig {
  description: string;
  defaultValue: boolean;
  environments?: Partial<Record<Environment, boolean>>;
  rolloutPercentage?: number;
}

export const featureFlags = {
  newDashboard: {
    description: "Nova versão do dashboard",
    defaultValue: false,
    environments: { development: true, staging: true, production: false },
  },
  darkModeV2: {
    description: "Dark mode v2 com temas customizados",
    defaultValue: false,
    environments: { development: true },
  },
  betaFeatures: {
    description: "Features experimentais",
    defaultValue: false,
    rolloutPercentage: 10,
  },
} as const satisfies Record<string, FeatureFlagConfig>;

export type FeatureFlagName = keyof typeof featureFlags;
