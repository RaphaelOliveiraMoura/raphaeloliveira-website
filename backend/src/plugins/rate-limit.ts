import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

import { env } from "../config/env";

export default fp(
  async (app: FastifyInstance) => {
    await app.register(rateLimit, {
      max: env.RATE_LIMIT_MAX,
      timeWindow: env.RATE_LIMIT_WINDOW_MS,
    });
  },
  { name: "rate-limit" },
);
