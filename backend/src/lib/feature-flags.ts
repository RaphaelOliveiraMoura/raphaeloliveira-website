import { createHash } from "node:crypto";

import type { FeatureFlag, FlagConditions } from "../db/schema/feature-flags";

/**
 * Context used to evaluate feature flags against conditions.
 */
export interface FlagContext {
  userId?: string;
  role?: string;
  environment: string;
}

/**
 * Compute a deterministic percentage bucket for a user + flag key.
 * Uses a simple hash to ensure consistency across evaluations.
 */
function hashPercentage(userId: string, flagKey: string): number {
  const hash = createHash("md5").update(`${flagKey}:${userId}`).digest("hex");
  // Take first 8 hex chars → 32-bit integer → mod 100
  const num = parseInt(hash.slice(0, 8), 16);
  return num % 100;
}

/**
 * Evaluate whether a feature flag is enabled for a given context.
 *
 * Evaluation rules:
 * 1. If `enabled` is false, the flag is always off.
 * 2. If `enabled` is true and no conditions exist, the flag is always on.
 * 3. If conditions exist, ALL specified conditions must be satisfied:
 *    - `environments`: current environment must be in the list
 *    - `roles`: user role must be in the list
 *    - `userIds`: user ID must be in the list
 *    - `percentage`: user must fall within the percentage bucket
 *
 * @example
 * ```ts
 * const isEnabled = evaluateFlag(flag, {
 *   userId: request.user.id,
 *   role: request.user.role,
 *   environment: env.NODE_ENV,
 * });
 * ```
 */
export function evaluateFlag(flag: FeatureFlag, context: FlagContext): boolean {
  // Globally disabled
  if (!flag.enabled) return false;

  // No conditions means enabled for everyone
  const conditions = flag.conditions as FlagConditions | null;
  if (!conditions) return true;

  // Check environment restriction
  if (
    conditions.environments &&
    conditions.environments.length > 0 &&
    !conditions.environments.includes(context.environment)
  ) {
    return false;
  }

  // Check role restriction
  if (
    conditions.roles &&
    conditions.roles.length > 0 &&
    (!context.role || !conditions.roles.includes(context.role))
  ) {
    return false;
  }

  // Check user ID restriction
  if (
    conditions.userIds &&
    conditions.userIds.length > 0 &&
    (!context.userId || !conditions.userIds.includes(context.userId))
  ) {
    return false;
  }

  // Check percentage rollout
  if (conditions.percentage !== undefined && conditions.percentage !== null) {
    if (!context.userId) return false;

    const bucket = hashPercentage(context.userId, flag.key);
    if (bucket >= conditions.percentage) return false;
  }

  return true;
}
