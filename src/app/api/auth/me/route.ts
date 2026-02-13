import { NextRequest } from "next/server";

import { proxyToBackend } from "@/app/api/backend-proxy";

/**
 * GET /api/auth/me
 * Proxy para o backend Fastify: GET /auth/me
 */
export async function GET(request: NextRequest) {
  return proxyToBackend({
    path: "/auth/me",
    method: "GET",
    request,
    forwardBody: false,
  });
}
