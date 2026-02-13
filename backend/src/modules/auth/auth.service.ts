import { randomUUID } from "node:crypto";

import { and, eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";

import { env } from "../../config/env";
import { db } from "../../db/index";
import { refreshTokens, users } from "../../db/schema/index";
import { UnauthorizedError } from "../../lib/errors";
import { verifyPassword } from "../../lib/hash";
import type { LoginInput } from "./auth.schemas";
import type { AuthenticatedUser, TokenPair } from "./auth.types";

/**
 * Parse a duration string like "7d", "15m", "1h" into milliseconds.
 */
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7d

  const value = parseInt(match[1]!, 10);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}

export class AuthService {
  constructor(private app: FastifyInstance) {}

  /**
   * Authenticate a user and return tokens.
   */
  async login(
    input: LoginInput,
  ): Promise<TokenPair & { user: AuthenticatedUser }> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const validPassword = await verifyPassword(
      input.password,
      user.passwordHash,
    );
    if (!validPassword) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const payload = { id: user.id, email: user.email, role: user.role };

    // Sign access token
    const accessToken = this.app.jwt.sign(payload);

    // Create refresh token
    const refreshToken = randomUUID();
    const expiresAt = new Date(
      Date.now() + parseDuration(env.JWT_REFRESH_EXPIRATION),
    );

    await db.insert(refreshTokens).values({
      token: refreshToken,
      userId: user.id,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Refresh an access token using a valid refresh token.
   */
  async refresh(token: string): Promise<{ accessToken: string }> {
    const [stored] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(eq(refreshTokens.token, token), eq(refreshTokens.revoked, false)),
      )
      .limit(1);

    if (!stored || stored.expiresAt < new Date()) {
      // Revoke if expired
      if (stored) {
        await db
          .update(refreshTokens)
          .set({ revoked: true })
          .where(eq(refreshTokens.id, stored.id));
      }
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    // Get the user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, stored.userId))
      .limit(1);

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = this.app.jwt.sign(payload);

    return { accessToken };
  }

  /**
   * Revoke a refresh token (logout).
   */
  async logout(token: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.token, token));
  }

  /**
   * Get the authenticated user's profile.
   */
  async getMe(
    userId: string,
  ): Promise<(AuthenticatedUser & { createdAt: string }) | null> {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
        }
      : null;
  }
}
