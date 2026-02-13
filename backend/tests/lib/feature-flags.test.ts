import { describe, expect, it } from "vitest";

import type { FeatureFlag } from "../../src/db/schema/feature-flags";
import { evaluateFlag, type FlagContext } from "../../src/lib/feature-flags";

function makeFlag(overrides: Partial<FeatureFlag> = {}): FeatureFlag {
  return {
    id: "flag-1",
    key: "test-flag",
    description: "A test flag",
    enabled: true,
    conditions: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

const defaultContext: FlagContext = {
  userId: "user-1",
  role: "user",
  environment: "test",
};

describe("evaluateFlag", () => {
  it("should return false when flag is disabled", () => {
    const flag = makeFlag({ enabled: false });
    expect(evaluateFlag(flag, defaultContext)).toBe(false);
  });

  it("should return true when enabled with no conditions", () => {
    const flag = makeFlag({ enabled: true, conditions: null });
    expect(evaluateFlag(flag, defaultContext)).toBe(true);
  });

  // ---- Environment conditions ----

  describe("environment conditions", () => {
    it("should return true when current environment is in the list", () => {
      const flag = makeFlag({
        conditions: { environments: ["test", "production"] },
      });
      expect(evaluateFlag(flag, defaultContext)).toBe(true);
    });

    it("should return false when current environment is NOT in the list", () => {
      const flag = makeFlag({
        conditions: { environments: ["production", "staging"] },
      });
      expect(evaluateFlag(flag, defaultContext)).toBe(false);
    });

    it("should pass when environments array is empty", () => {
      const flag = makeFlag({
        conditions: { environments: [] },
      });
      expect(evaluateFlag(flag, defaultContext)).toBe(true);
    });
  });

  // ---- Role conditions ----

  describe("role conditions", () => {
    it("should return true when user role is in the list", () => {
      const flag = makeFlag({
        conditions: { roles: ["user", "admin"] },
      });
      expect(evaluateFlag(flag, defaultContext)).toBe(true);
    });

    it("should return false when user role is NOT in the list", () => {
      const flag = makeFlag({
        conditions: { roles: ["admin"] },
      });
      expect(evaluateFlag(flag, defaultContext)).toBe(false);
    });

    it("should return false when user has no role", () => {
      const flag = makeFlag({
        conditions: { roles: ["admin"] },
      });
      expect(evaluateFlag(flag, { ...defaultContext, role: undefined })).toBe(
        false,
      );
    });
  });

  // ---- User ID conditions ----

  describe("userIds conditions", () => {
    it("should return true when user ID is in the list", () => {
      const flag = makeFlag({
        conditions: { userIds: ["user-1", "user-2"] },
      });
      expect(evaluateFlag(flag, defaultContext)).toBe(true);
    });

    it("should return false when user ID is NOT in the list", () => {
      const flag = makeFlag({
        conditions: { userIds: ["user-999"] },
      });
      expect(evaluateFlag(flag, defaultContext)).toBe(false);
    });

    it("should return false when userId is not provided", () => {
      const flag = makeFlag({
        conditions: { userIds: ["user-1"] },
      });
      expect(evaluateFlag(flag, { ...defaultContext, userId: undefined })).toBe(
        false,
      );
    });
  });

  // ---- Percentage rollout ----

  describe("percentage conditions", () => {
    it("should return false when percentage is 0", () => {
      const flag = makeFlag({
        conditions: { percentage: 0 },
      });
      expect(evaluateFlag(flag, defaultContext)).toBe(false);
    });

    it("should return true when percentage is 100", () => {
      const flag = makeFlag({
        conditions: { percentage: 100 },
      });
      expect(evaluateFlag(flag, defaultContext)).toBe(true);
    });

    it("should be deterministic for the same user + flag", () => {
      const flag = makeFlag({
        conditions: { percentage: 50 },
      });
      const result1 = evaluateFlag(flag, defaultContext);
      const result2 = evaluateFlag(flag, defaultContext);
      expect(result1).toBe(result2);
    });

    it("should return false when userId is not provided", () => {
      const flag = makeFlag({
        conditions: { percentage: 50 },
      });
      expect(evaluateFlag(flag, { ...defaultContext, userId: undefined })).toBe(
        false,
      );
    });
  });

  // ---- Combined conditions ----

  describe("combined conditions", () => {
    it("should require ALL conditions to pass (AND logic)", () => {
      const flag = makeFlag({
        conditions: {
          environments: ["test"],
          roles: ["admin"],
        },
      });

      // Role doesn't match → false
      expect(evaluateFlag(flag, { ...defaultContext, role: "user" })).toBe(
        false,
      );

      // Both match → true
      expect(evaluateFlag(flag, { ...defaultContext, role: "admin" })).toBe(
        true,
      );
    });

    it("should fail if environment matches but role doesn't", () => {
      const flag = makeFlag({
        conditions: {
          environments: ["test"],
          roles: ["admin"],
          userIds: ["user-1"],
        },
      });

      expect(
        evaluateFlag(flag, {
          userId: "user-1",
          role: "user",
          environment: "test",
        }),
      ).toBe(false);
    });
  });
});
