import { NextRequest } from "next/server";

import { proxyToBackend } from "@/app/api/backend-proxy";

/**
 * POST /api/auth/social
 * Proxy para o backend Fastify: POST /auth/social
 */
export async function POST(request: NextRequest) {
  return proxyToBackend({
    path: "/auth/social",
    method: "POST",
    request,
  });
}
