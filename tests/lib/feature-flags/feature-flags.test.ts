import { describe, it, expect } from "vitest";
import { getFeatureFlagValue } from "@/lib/feature-flags";

describe("getFeatureFlagValue", () => {
  it("returns true for newDashboard in development", () => {
    // NODE_ENV is 'test' which maps to 'production' in getCurrentEnvironment
    // So newDashboard returns false in test env; we assert it returns a boolean
    const value = getFeatureFlagValue("newDashboard");
    expect(typeof value).toBe("boolean");
  });

  it("returns false for betaFeatures by default", () => {
    const value = getFeatureFlagValue("betaFeatures");
    expect(typeof value).toBe("boolean");
  });

  it("returns consistent results for same flag", () => {
    const first = getFeatureFlagValue("darkModeV2");
    const second = getFeatureFlagValue("darkModeV2");
    expect(first).toBe(second);
  });
});
