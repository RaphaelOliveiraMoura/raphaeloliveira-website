import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

import { env } from "../config/env";

export default fp(
  async (app: FastifyInstance) => {
    // Cookie support (for refresh tokens)
    await app.register(cookie);

    // JWT plugin
    await app.register(jwt, {
      secret: env.JWT_SECRET,
      sign: {
        expiresIn: env.JWT_ACCESS_EXPIRATION,
      },
    });
  },
  { name: "auth" },
);
