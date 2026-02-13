import { eq } from "drizzle-orm";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

import { db } from "../db/index";
import { idempotencyKeys } from "../db/schema/idempotency-keys";
import { container } from "../lib/container";
import { ConflictError } from "../lib/errors";
import { logger } from "../lib/logger";

const log = logger.child({ module: "idempotency" });

/** How long to lock a key while processing (30 seconds). */
const LOCK_DURATION_MS = 30_000;

/** How long to keep idempotency keys (24 hours). */
const KEY_TTL_MS = 24 * 60 * 60 * 1000;

/** Cache TTL for idempotency responses (1 hour). */
const CACHE_TTL = 3600;

/** Methods that support idempotency keys. */
const IDEMPOTENT_METHODS = new Set(["POST", "PUT", "PATCH"]);

async function idempotencyPlugin(app: FastifyInstance) {
  app.addHook(
    "preHandler",
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!IDEMPOTENT_METHODS.has(request.method)) return;

      const idempotencyKey = request.headers["idempotency-key"] as
        | string
        | undefined;
      if (!idempotencyKey) return;

      const userId = request.user?.id;
      if (!userId) return; // Only apply to authenticated requests

      const cacheKey = `idempotency:${userId}:${idempotencyKey}`;

      // Try cache first
      try {
        const cache = container.resolve("cache");
        const cached = await cache.get<{
          statusCode: number;
          body: unknown;
          headers: Record<string, string>;
        }>(cacheKey);

        if (cached) {
          log.debug({ key: idempotencyKey }, "Idempotency cache hit");
          reply.header("Idempotency-Key-Status", "hit");

          for (const [k, v] of Object.entries(cached.headers)) {
            reply.header(k, v);
          }

          return reply.status(cached.statusCode).send(cached.body);
        }
      } catch {
        // Cache not available, continue to DB check
      }

      // Check DB
      const [existing] = await db
        .select()
        .from(idempotencyKeys)
        .where(eq(idempotencyKeys.key, idempotencyKey))
        .limit(1);

      if (existing) {
        // Check if it's still being processed (locked)
        if (
          existing.lockedUntil &&
          existing.lockedUntil > new Date() &&
          !existing.statusCode
        ) {
          throw new ConflictError("Request", "idempotency-key");
        }

        // If we have a completed response, return it
        if (existing.statusCode && existing.responseBody) {
          log.debug({ key: idempotencyKey }, "Idempotency DB hit");
          reply.header("Idempotency-Key-Status", "hit");

          const headers = (existing.responseHeaders ?? {}) as Record<
            string,
            string
          >;
          for (const [k, v] of Object.entries(headers)) {
            reply.header(k, v);
          }

          return reply.status(existing.statusCode).send(existing.responseBody);
        }

        // Expired or incomplete — update lock
        await db
          .update(idempotencyKeys)
          .set({
            lockedUntil: new Date(Date.now() + LOCK_DURATION_MS),
          })
          .where(eq(idempotencyKeys.key, idempotencyKey));
      } else {
        // Create a new locked entry
        await db.insert(idempotencyKeys).values({
          key: idempotencyKey,
          userId,
          method: request.method,
          path: request.url,
          lockedUntil: new Date(Date.now() + LOCK_DURATION_MS),
          expiresAt: new Date(Date.now() + KEY_TTL_MS),
        });
      }

      // Mark the request so onSend captures the response
      (request as unknown as Record<string, unknown>).__idempotencyKey =
        idempotencyKey;
      (request as unknown as Record<string, unknown>).__idempotencyCacheKey =
        cacheKey;
      reply.header("Idempotency-Key-Status", "miss");
    },
  );

  // Capture the response for future replay
  app.addHook(
    "onSend",
    async (request: FastifyRequest, reply: FastifyReply, payload: unknown) => {
      const idempotencyKey = (request as unknown as Record<string, unknown>)
        .__idempotencyKey as string | undefined;
      if (!idempotencyKey) return payload;

      const cacheKey = (request as unknown as Record<string, unknown>)
        .__idempotencyCacheKey as string;
      const statusCode = reply.statusCode;

      // Only cache successful responses (2xx)
      if (statusCode < 200 || statusCode >= 300) {
        // Remove the lock on failure
        await db
          .update(idempotencyKeys)
          .set({ lockedUntil: null })
          .where(eq(idempotencyKeys.key, idempotencyKey));
        return payload;
      }

      let body: unknown;
      try {
        body = typeof payload === "string" ? JSON.parse(payload) : payload;
      } catch {
        body = payload;
      }

      const headers: Record<string, string> = {};
      const contentType = reply.getHeader("content-type");
      if (contentType) headers["content-type"] = String(contentType);

      // Save to DB
      await db
        .update(idempotencyKeys)
        .set({
          statusCode,
          responseBody: body,
          responseHeaders: headers,
          lockedUntil: null,
        })
        .where(eq(idempotencyKeys.key, idempotencyKey));

      // Cache the response
      try {
        const cache = container.resolve("cache");
        await cache.set(cacheKey, { statusCode, body, headers }, CACHE_TTL);
      } catch {
        // Cache not available
      }

      return payload;
    },
  );
}

export default fp(idempotencyPlugin, {
  name: "idempotency",
  dependencies: ["auth"],
});
