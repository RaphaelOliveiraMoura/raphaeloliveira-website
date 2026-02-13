import type { FastifyReply, FastifyRequest } from "fastify";

import { UnauthorizedError } from "../lib/errors";

/**
 * Pre-handler hook that verifies authentication.
 *
 * Tries JWT access token first (Authorization: Bearer <token>).
 * Falls back to API key authentication (X-API-Key header) if no JWT is present.
 *
 * On success, `request.user` is populated with the token/key payload
 * and `request.ctx` is enriched with user identity for the canonical log line.
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const hasAuthHeader = !!request.headers.authorization;
  const hasApiKey = !!request.headers["x-api-key"];

  // Try JWT first
  if (hasAuthHeader) {
    try {
      await request.jwtVerify();

      // Enrich wide event context with authenticated user info
      if (request.ctx) {
        request.ctx.userId = request.user.id;
        request.ctx.userEmail = request.user.email;
        request.ctx.userRole = request.user.role;
      }
      return;
    } catch {
      throw new UnauthorizedError("Invalid or expired access token");
    }
  }

  // Fallback to API key
  if (hasApiKey) {
    const { authenticateApiKey } = await import("./authenticate-api-key");
    return authenticateApiKey(request, reply);
  }

  throw new UnauthorizedError("Authentication required");
}
