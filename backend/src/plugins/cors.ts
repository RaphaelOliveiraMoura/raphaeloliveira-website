import cors from "@fastify/cors";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

import { env } from "../config/env";

export default fp(
  async (app: FastifyInstance) => {
    await app.register(cors, {
      origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    });
  },
  { name: "cors" },
);
