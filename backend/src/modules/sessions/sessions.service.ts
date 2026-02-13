import type { NewSession, Session } from "../../db/schema/sessions";
import { ForbiddenError, NotFoundError } from "../../lib/errors";
import { SessionsRepository } from "./sessions.repository";

/**
 * Parse a User-Agent string into a friendly device name.
 */
function parseDeviceName(userAgent: string | undefined): string | null {
  if (!userAgent) return null;

  // Simple heuristic for device name
  if (userAgent.includes("Mobile")) return "Mobile";
  if (userAgent.includes("Tablet")) return "Tablet";
  if (userAgent.includes("Chrome")) return "Chrome Browser";
  if (userAgent.includes("Firefox")) return "Firefox Browser";
  if (userAgent.includes("Safari")) return "Safari Browser";
  if (userAgent.includes("Edge")) return "Edge Browser";
  return "Unknown Device";
}

export class SessionsService {
  private repository = new SessionsRepository();

  /**
   * Create a new session for a user.
   */
  async createSession(params: {
    userId: string;
    refreshTokenId: string;
    ip?: string;
    userAgent?: string;
    expiresAt: Date;
  }): Promise<Session> {
    const data: NewSession = {
      userId: params.userId,
      refreshTokenId: params.refreshTokenId,
      ip: params.ip ?? null,
      userAgent: params.userAgent ?? null,
      deviceName: parseDeviceName(params.userAgent),
      expiresAt: params.expiresAt,
    };

    return this.repository.create(data);
  }

  /**
   * List all active sessions for a user, marking the current one.
   */
  async listActiveSessions(
    userId: string,
    currentSessionId?: string,
  ): Promise<Array<Session & { isCurrent: boolean }>> {
    const activeSessions = await this.repository.findActiveByUserId(userId);

    return activeSessions.map((session) => ({
      ...session,
      isCurrent: session.id === currentSessionId,
    }));
  }

  /**
   * Revoke a specific session. Users can only revoke their own sessions.
   */
  async revokeSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.repository.findById(sessionId);

    if (!session) {
      throw new NotFoundError("Session", sessionId);
    }

    if (session.userId !== userId) {
      throw new ForbiddenError("You can only revoke your own sessions");
    }

    await this.repository.revoke(sessionId);
  }

  /**
   * Revoke all sessions except the current one.
   */
  async revokeAllExcept(
    userId: string,
    currentSessionId: string,
  ): Promise<number> {
    return this.repository.revokeAllExcept(userId, currentSessionId);
  }

  /**
   * Update the last active timestamp for a session.
   */
  async touchSession(sessionId: string): Promise<void> {
    await this.repository.touch(sessionId);
  }

  /**
   * Revoke all sessions for a user (used on password reset).
   */
  async revokeAllByUserId(userId: string): Promise<void> {
    await this.repository.revokeAllByUserId(userId);
  }

  /**
   * Find session by refresh token ID.
   */
  async findByRefreshTokenId(
    refreshTokenId: string,
  ): Promise<Session | undefined> {
    return this.repository.findByRefreshTokenId(refreshTokenId);
  }
}
