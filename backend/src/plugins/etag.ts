import etag from "@fastify/etag";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

/**
 * ETag support via @fastify/etag.
 *
 * Automatically adds ETag headers to responses and handles
 * conditional requests (If-None-Match → 304 Not Modified).
 *
 * This reduces bandwidth for unchanged resources and improves cache efficiency.
 */
export default fp(
  async (app: FastifyInstance) => {
    await app.register(etag);
  },
  { name: "etag" },
);
