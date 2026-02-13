import { and, desc, eq, gte, isNull } from "drizzle-orm";

import { db } from "../../db/index";
import type { NewSession, Session } from "../../db/schema/sessions";
import { sessions } from "../../db/schema/sessions";

export class SessionsRepository {
  /**
   * Create a new session.
   */
  async create(data: NewSession): Promise<Session> {
    const [session] = await db.insert(sessions).values(data).returning();
    return session!;
  }

  /**
   * Find all active (non-revoked, non-expired) sessions for a user.
   */
  async findActiveByUserId(userId: string): Promise<Session[]> {
    const now = new Date();
    return db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, userId),
          isNull(sessions.revokedAt),
          gte(sessions.expiresAt, now),
        ),
      )
      .orderBy(desc(sessions.lastActiveAt));
  }

  /**
   * Find a session by ID.
   */
  async findById(id: string): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, id))
      .limit(1);
    return session;
  }

  /**
   * Update lastActiveAt for a session.
   */
  async touch(id: string): Promise<void> {
    await db
      .update(sessions)
      .set({ lastActiveAt: new Date() })
      .where(eq(sessions.id, id));
  }

  /**
   * Revoke a single session.
   */
  async revoke(id: string): Promise<void> {
    await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.id, id));
  }

  /**
   * Revoke all sessions for a user except the specified one.
   */
  async revokeAllExcept(userId: string, exceptId: string): Promise<number> {
    const result = await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)))
      .returning({ id: sessions.id });

    // Don't revoke the current session
    if (exceptId) {
      await db
        .update(sessions)
        .set({ revokedAt: null })
        .where(eq(sessions.id, exceptId));
    }

    return result.length - 1; // Exclude the current session
  }

  /**
   * Revoke all sessions for a user.
   */
  async revokeAllByUserId(userId: string): Promise<number> {
    const result = await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)))
      .returning({ id: sessions.id });

    return result.length;
  }

  /**
   * Find a session by its associated refresh token ID.
   */
  async findByRefreshTokenId(
    refreshTokenId: string,
  ): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.refreshTokenId, refreshTokenId))
      .limit(1);
    return session;
  }
}
