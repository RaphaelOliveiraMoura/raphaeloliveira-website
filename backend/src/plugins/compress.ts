import compress from "@fastify/compress";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

/**
 * Response compression via @fastify/compress.
 *
 * Supports gzip, deflate, and brotli. Responses are compressed
 * automatically when the client sends `Accept-Encoding`.
 *
 * Threshold is set to 1KB — smaller responses are sent uncompressed.
 */
export default fp(
  async (app: FastifyInstance) => {
    await app.register(compress, {
      threshold: 1024,
    });
  },
  { name: "compress" },
);
