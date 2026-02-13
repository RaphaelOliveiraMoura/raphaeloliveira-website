import { randomUUID } from "node:crypto";

import { and, eq, isNull } from "drizzle-orm";
import type { FastifyInstance } from "fastify";

import { env } from "../../config/env";
import { db } from "../../db/index";
import {
  emailVerificationTokens,
  passwordResetTokens,
  refreshTokens,
  users,
} from "../../db/schema/index";
import { container } from "../../lib/container";
import { generateToken, sha256 } from "../../lib/crypto";
import { expiresIn, parseDuration } from "../../lib/duration";
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../lib/errors";
import { domainEvents } from "../../lib/events";
import { hashPassword, verifyPassword } from "../../lib/hash";
import { renderTemplate } from "../../services/mail/templates";
import type {
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "./auth.schemas";
import type { AuthenticatedUser, TokenPair } from "./auth.types";

export class AuthService {
  constructor(private app: FastifyInstance) {}

  /**
   * Check if an account is currently locked.
   */
  private isAccountLocked(lockedUntil: Date | null): boolean {
    if (!lockedUntil) return false;
    return lockedUntil > new Date();
  }

  /**
   * Increment failed login attempts and lock the account if threshold is reached.
   */
  private async handleFailedLogin(
    userId: string,
    email: string,
    currentAttempts: number,
    ip: string,
  ) {
    const newAttempts = currentAttempts + 1;

    if (newAttempts >= env.LOGIN_MAX_ATTEMPTS) {
      const lockedUntil = new Date(
        Date.now() + parseDuration(env.LOGIN_LOCKOUT_DURATION),
      );

      await db
        .update(users)
        .set({ failedLoginAttempts: newAttempts, lockedUntil })
        .where(eq(users.id, userId));

      domainEvents.emit("auth.account.locked", {
        userId,
        email,
        attempts: newAttempts,
      });
    } else {
      await db
        .update(users)
        .set({ failedLoginAttempts: newAttempts })
        .where(eq(users.id, userId));
    }

    domainEvents.emit("auth.login.failed", {
      email,
      ip,
      reason: "invalid_password",
    });
  }

  /**
   * Reset failed login attempts after a successful login.
   */
  private async resetFailedAttempts(userId: string) {
    await db
      .update(users)
      .set({ failedLoginAttempts: 0, lockedUntil: null })
      .where(eq(users.id, userId));
  }

  /**
   * Authenticate a user and return tokens.
   */
  async login(
    input: LoginInput,
    ip = "unknown",
  ): Promise<TokenPair & { user: AuthenticatedUser }> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, input.email), isNull(users.deletedAt)))
      .limit(1);

    if (!user) {
      domainEvents.emit("auth.login.failed", {
        email: input.email,
        ip,
        reason: "user_not_found",
      });
      throw new UnauthorizedError("Invalid email or password");
    }

    // Check account lockout
    if (this.isAccountLocked(user.lockedUntil)) {
      domainEvents.emit("auth.login.failed", {
        email: input.email,
        ip,
        reason: "account_locked",
      });
      throw new UnauthorizedError(
        "Account is temporarily locked due to too many failed login attempts. Please try again later.",
      );
    }

    const validPassword = await verifyPassword(
      input.password,
      user.passwordHash,
    );

    if (!validPassword) {
      await this.handleFailedLogin(
        user.id,
        user.email,
        user.failedLoginAttempts,
        ip,
      );
      throw new UnauthorizedError("Invalid email or password");
    }

    // Reset failed attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await this.resetFailedAttempts(user.id);
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

    domainEvents.emit("auth.login", {
      userId: user.id,
      email: user.email,
      ip,
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
   * Implements token rotation: old token is revoked, new pair is issued.
   */
  async refresh(
    token: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
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

    // Revoke the current refresh token (rotation)
    await db
      .update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.id, stored.id));

    // Get the user
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, stored.userId), isNull(users.deletedAt)))
      .limit(1);

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = this.app.jwt.sign(payload);

    // Issue a new refresh token
    const newRefreshToken = randomUUID();
    const expiresAt = new Date(
      Date.now() + parseDuration(env.JWT_REFRESH_EXPIRATION),
    );

    await db.insert(refreshTokens).values({
      token: newRefreshToken,
      userId: user.id,
      expiresAt,
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Revoke a refresh token (logout).
   */
  async logout(token: string, userId?: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.token, token));

    if (userId) {
      domainEvents.emit("auth.logout", { userId });
    }
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
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
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

  // ---- Password Reset ----

  /**
   * Request a password reset. Sends an email with a reset link.
   * Always returns success (to prevent email enumeration).
   */
  async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, input.email), isNull(users.deletedAt)))
      .limit(1);

    if (!user) {
      // Don't reveal whether the email exists
      return;
    }

    // Generate a secure token and store its hash
    const rawToken = generateToken();
    const tokenHash = sha256(rawToken);

    await db.insert(passwordResetTokens).values({
      tokenHash,
      userId: user.id,
      expiresAt: expiresIn("1h"),
    });

    // Send reset email
    const resetUrl = `${env.APP_URL}/auth/reset-password?token=${rawToken}`;
    const { subject, html } = renderTemplate("password-reset", {
      name: user.name,
      resetUrl,
      expiresIn: "1 hora",
      appName: env.APP_NAME,
    });

    const mail = container.resolve("mail");
    await mail.send({ to: user.email, subject, html });

    domainEvents.emit("auth.password.reset.requested", {
      userId: user.id,
      email: user.email,
    });
  }

  /**
   * Reset a password using a valid reset token.
   */
  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const tokenHash = sha256(input.token);

    const [stored] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          eq(passwordResetTokens.used, false),
        ),
      )
      .limit(1);

    if (!stored || stored.expiresAt < new Date()) {
      throw new ValidationError({
        token: "Invalid or expired reset token",
      });
    }

    // Hash the new password and update
    const newPasswordHash = await hashPassword(input.password);

    await db
      .update(users)
      .set({ passwordHash: newPasswordHash })
      .where(eq(users.id, stored.userId));

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, stored.id));

    // Revoke all refresh tokens for this user (force re-login)
    await db
      .update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.userId, stored.userId));

    domainEvents.emit("auth.password.reset.completed", {
      userId: stored.userId,
    });
  }

  // ---- Email Verification ----

  /**
   * Send an email verification link.
   */
  async sendVerificationEmail(userId: string): Promise<void> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .limit(1);

    if (!user) throw new NotFoundError("User", userId);

    if (user.emailVerifiedAt) {
      throw new ValidationError({ email: "Email is already verified" });
    }

    const rawToken = generateToken();
    const tokenHash = sha256(rawToken);

    await db.insert(emailVerificationTokens).values({
      tokenHash,
      userId: user.id,
      expiresAt: expiresIn("24h"),
    });

    const verifyUrl = `${env.APP_URL}/auth/verify-email?token=${rawToken}`;
    const { subject, html } = renderTemplate("email-verification", {
      name: user.name,
      verifyUrl,
      expiresIn: "24 horas",
      appName: env.APP_NAME,
    });

    const mail = container.resolve("mail");
    await mail.send({ to: user.email, subject, html });
  }

  /**
   * Verify an email using a valid verification token.
   */
  async verifyEmail(input: VerifyEmailInput): Promise<void> {
    const tokenHash = sha256(input.token);

    const [stored] = await db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.tokenHash, tokenHash),
          eq(emailVerificationTokens.used, false),
        ),
      )
      .limit(1);

    if (!stored || stored.expiresAt < new Date()) {
      throw new ValidationError({
        token: "Invalid or expired verification token",
      });
    }

    // Mark email as verified
    await db
      .update(users)
      .set({ emailVerifiedAt: new Date() })
      .where(eq(users.id, stored.userId));

    // Mark token as used
    await db
      .update(emailVerificationTokens)
      .set({ used: true })
      .where(eq(emailVerificationTokens.id, stored.id));

    // Get user email for event
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, stored.userId))
      .limit(1);

    if (user) {
      domainEvents.emit("auth.email.verified", {
        userId: stored.userId,
        email: user.email,
      });
    }
  }
}
