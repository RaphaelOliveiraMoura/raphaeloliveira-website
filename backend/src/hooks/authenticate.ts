import type { FastifyReply, FastifyRequest } from "fastify";

import { UnauthorizedError } from "../lib/errors";

/**
 * Pre-handler hook that verifies the JWT access token.
 * Attach to routes/plugins that require authentication.
 *
 * On success, `request.user` is populated with the token payload
 * and `request.ctx` is enriched with user identity for the canonical log line.
 */
export async function authenticate(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify();

    // Enrich wide event context with authenticated user info
    if (request.ctx) {
      request.ctx.userId = request.user.id;
      request.ctx.userEmail = request.user.email;
      request.ctx.userRole = request.user.role;
    }
  } catch {
    throw new UnauthorizedError("Invalid or expired access token");
  }
}
