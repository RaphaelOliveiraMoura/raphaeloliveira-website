import { NextRequest } from "next/server";

import { proxyToBackend } from "@/app/api/backend-proxy";

/**
 * POST /api/auth/refresh
 * Proxy para o backend Fastify: POST /auth/refresh
 * Encaminha o cookie refresh-token e retorna o novo accessToken.
 */
export async function POST(request: NextRequest) {
  return proxyToBackend({
    path: "/auth/refresh",
    method: "POST",
    request,
    forwardBody: false,
  });
}
