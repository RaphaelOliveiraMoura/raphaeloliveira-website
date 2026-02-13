import { and, eq, isNotNull, lt, or } from "drizzle-orm";

import { db } from "../../../db/index";
import {
  emailVerificationTokens,
  passwordResetTokens,
  refreshTokens,
} from "../../../db/schema/index";
import { logger } from "../../../lib/logger";
import type { QueueProvider } from "../queue.port";

const log = logger.child({ module: "worker:cleanup" });

/**
 * Register cleanup workers for expired data.
 * These run as scheduled cron jobs to keep the database clean.
 */
export function registerCleanupWorkers(queue: QueueProvider): void {
  // Clean up expired/revoked refresh tokens
  queue.process("cleanup:expired-tokens", async (job) => {
    log.debug({ jobId: job.id }, "Cleaning expired tokens");
    const now = new Date();

    // Delete expired or revoked refresh tokens older than 7 days
    const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const deletedRefresh = await db
      .delete(refreshTokens)
      .where(
        or(
          lt(refreshTokens.expiresAt, now),
          and(
            eq(refreshTokens.revoked, true),
            lt(refreshTokens.createdAt, cutoff),
          ),
        ),
      )
      .returning({ id: refreshTokens.id });

    // Delete expired password reset tokens
    const deletedReset = await db
      .delete(passwordResetTokens)
      .where(
        or(
          lt(passwordResetTokens.expiresAt, now),
          eq(passwordResetTokens.used, true),
        ),
      )
      .returning({ id: passwordResetTokens.id });

    // Delete expired email verification tokens
    const deletedVerification = await db
      .delete(emailVerificationTokens)
      .where(
        or(
          lt(emailVerificationTokens.expiresAt, now),
          eq(emailVerificationTokens.used, true),
        ),
      )
      .returning({ id: emailVerificationTokens.id });

    log.info(
      {
        refreshTokens: deletedRefresh.length,
        resetTokens: deletedReset.length,
        verificationTokens: deletedVerification.length,
      },
      "Token cleanup completed",
    );
  });

  // Clean up expired sessions
  queue.process("cleanup:inactive-sessions", async (job) => {
    log.debug({ jobId: job.id }, "Cleaning inactive sessions");

    // Sessions cleanup is handled by the sessions module if present.
    // This worker ensures stale sessions are removed even if the module
    // is loaded after the worker is registered.
    try {
      const { sessions } = await import("../../../db/schema/sessions");
      const now = new Date();

      const deleted = await db
        .delete(sessions)
        .where(or(lt(sessions.expiresAt, now), isNotNull(sessions.revokedAt)))
        .returning({ id: sessions.id });

      log.info({ sessions: deleted.length }, "Session cleanup completed");
    } catch {
      // Sessions module not yet loaded — skip
      log.debug("Sessions table not available, skipping cleanup");
    }
  });

  // Clean up expired idempotency keys
  queue.process("cleanup:idempotency-keys", async (job) => {
    log.debug({ jobId: job.id }, "Cleaning expired idempotency keys");

    try {
      const { idempotencyKeys } =
        await import("../../../db/schema/idempotency-keys");
      const now = new Date();

      const deleted = await db
        .delete(idempotencyKeys)
        .where(lt(idempotencyKeys.expiresAt, now))
        .returning({ key: idempotencyKeys.key });

      log.info(
        { idempotencyKeys: deleted.length },
        "Idempotency key cleanup completed",
      );
    } catch {
      log.debug("Idempotency keys table not available, skipping cleanup");
    }
  });
}
