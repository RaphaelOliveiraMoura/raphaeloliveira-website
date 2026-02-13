import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Generate a cryptographically secure random token as a hex string.
 *
 * @param bytes - Number of random bytes (default: 32 → 64 hex chars)
 *
 * @example
 * ```ts
 * const token = generateToken();     // 64-char hex string
 * const short = generateToken(16);   // 32-char hex string
 * ```
 */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

/**
 * Generate a URL-safe random token (base64url encoded).
 *
 * @param bytes - Number of random bytes (default: 32)
 *
 * @example
 * ```ts
 * const token = generateUrlSafeToken(); // e.g. "dGhpcyBpcyBhIHRlc3Q..."
 * ```
 */
export function generateUrlSafeToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url").replace(/=+$/, "");
}

/**
 * Create a SHA-256 hash of the given input.
 *
 * Useful for hashing tokens before storing them in the database,
 * so that a database leak doesn't expose the raw tokens.
 *
 * @example
 * ```ts
 * const hashed = sha256(rawToken);
 * // Store `hashed` in DB, compare later with sha256(incoming)
 * ```
 */
export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/**
 * Constant-time string comparison to prevent timing attacks.
 *
 * @example
 * ```ts
 * if (secureCompare(incomingToken, storedToken)) {
 *   // tokens match
 * }
 * ```
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return timingSafeEqual(bufA, bufB);
}

/**
 * Generate a numeric OTP (One-Time Password) of the specified length.
 *
 * @example
 * ```ts
 * generateOTP(6);  // e.g. "482931"
 * ```
 */
export function generateOTP(length = 6): string {
  const bytes = randomBytes(length);
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += (bytes[i]! % 10).toString();
  }
  return otp;
}
