/**
 * Supported duration units.
 */
type DurationUnit = "s" | "m" | "h" | "d";

const MULTIPLIERS: Record<DurationUnit, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

/**
 * Parse a human-readable duration string into milliseconds.
 *
 * Supported formats: `"30s"`, `"15m"`, `"2h"`, `"7d"`
 *
 * @param duration - Duration string (e.g. `"7d"`, `"15m"`)
 * @param fallbackMs - Fallback value in ms if parsing fails (default: 7 days)
 * @returns Duration in milliseconds
 *
 * @example
 * ```ts
 * parseDuration("15m");  // 900_000
 * parseDuration("7d");   // 604_800_000
 * parseDuration("30s");  // 30_000
 * parseDuration("2h");   // 7_200_000
 * ```
 */
export function parseDuration(
  duration: string,
  fallbackMs = 7 * 86_400_000,
): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return fallbackMs;

  const value = parseInt(match[1]!, 10);
  const unit = match[2] as DurationUnit;

  return value * MULTIPLIERS[unit];
}

/**
 * Format milliseconds into a human-readable duration string.
 *
 * @example
 * ```ts
 * formatDuration(900_000);      // "15m"
 * formatDuration(86_400_000);   // "1d"
 * formatDuration(7_200_000);    // "2h"
 * formatDuration(5_000);        // "5s"
 * ```
 */
export function formatDuration(ms: number): string {
  if (ms >= 86_400_000 && ms % 86_400_000 === 0) return `${ms / 86_400_000}d`;
  if (ms >= 3_600_000 && ms % 3_600_000 === 0) return `${ms / 3_600_000}h`;
  if (ms >= 60_000 && ms % 60_000 === 0) return `${ms / 60_000}m`;
  return `${ms / 1_000}s`;
}

/**
 * Calculate an expiration Date from now + a duration string.
 *
 * @example
 * ```ts
 * const expiresAt = expiresIn("7d"); // Date 7 days from now
 * ```
 */
export function expiresIn(duration: string): Date {
  return new Date(Date.now() + parseDuration(duration));
}
