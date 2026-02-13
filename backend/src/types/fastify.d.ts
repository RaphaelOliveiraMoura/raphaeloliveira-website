import type { RequestContext } from "../plugins/request-context";

import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    /** Authenticated user payload, set by the auth hook */
    user: {
      id: string;
      email: string;
      role: string;
    };

    /**
     * Wide Event / Canonical Log Line context.
     * Accumulated throughout the request lifecycle and emitted
     * as a single structured log line in the onResponse hook.
     */
    ctx: RequestContext;

    /** Authentication source: "jwt" | "api-key" */
    authSource?: "jwt" | "api-key";

    /** API key scopes (populated when authenticated via API key) */
    apiKeyScopes?: string[];
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      id: string;
      email: string;
      role: string;
    };
    user: {
      id: string;
      email: string;
      role: string;
    };
  }
}
