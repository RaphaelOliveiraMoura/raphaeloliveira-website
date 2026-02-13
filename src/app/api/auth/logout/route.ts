import { NextRequest } from "next/server";

import { proxyToBackend } from "@/app/api/backend-proxy";

/**
 * POST /api/auth/logout
 * Proxy para o backend Fastify: POST /auth/logout
 * Encaminha o cookie refresh-token para revogacao.
 */
export async function POST(request: NextRequest) {
  return proxyToBackend({
    path: "/auth/logout",
    method: "POST",
    request,
    forwardBody: false,
  });
}
