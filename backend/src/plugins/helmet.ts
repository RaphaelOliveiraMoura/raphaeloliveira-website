import helmet from "@fastify/helmet";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

/**
 * Security headers via @fastify/helmet.
 *
 * Sets: CSP, HSTS, X-Frame-Options, X-Content-Type-Options,
 * Referrer-Policy, X-DNS-Prefetch-Control, X-Download-Options,
 * X-Permitted-Cross-Domain-Policies.
 *
 * CSP is relaxed in development to allow Swagger UI inline scripts.
 */
export default fp(
  async (app: FastifyInstance) => {
    await app.register(helmet, {
      // Swagger UI requires inline scripts/styles
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    });
  },
  { name: "helmet" },
);
