import { and, eq, isNull } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";

import { db } from "../db/index";
import { users } from "../db/schema/index";
import { UnauthorizedError } from "../lib/errors";
import { ApiKeysService } from "../modules/api-keys/api-keys.service";

const apiKeysService = new ApiKeysService();

/**
 * Pre-handler hook that authenticates via API key (`X-API-Key` header).
 *
 * On success, `request.user` is populated with the key owner's profile
 * and `request.ctx` is enriched for the canonical log line.
 *
 * API keys are prefixed with `csk_` and hashed with SHA-256 for storage.
 */
export async function authenticateApiKey(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const rawKey = request.headers["x-api-key"] as string | undefined;

  if (!rawKey) {
    throw new UnauthorizedError("Missing API key");
  }

  const apiKey = await apiKeysService.validateKey(rawKey);

  if (!apiKey) {
    throw new UnauthorizedError("Invalid or expired API key");
  }

  // Fetch the key owner
  const [user] = await db
    .select({ id: users.id, email: users.email, role: users.role })
    .from(users)
    .where(and(eq(users.id, apiKey.userId), isNull(users.deletedAt)))
    .limit(1);

  if (!user) {
    throw new UnauthorizedError("API key owner not found");
  }

  // Populate request.user (same shape as JWT auth)
  request.user = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  // Enrich wide event context
  if (request.ctx) {
    request.ctx.userId = user.id;
    request.ctx.userEmail = user.email;
    request.ctx.userRole = user.role;
  }
}
