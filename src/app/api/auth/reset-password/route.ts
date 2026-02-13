import { NextRequest } from "next/server";

import { proxyToBackend } from "@/app/api/backend-proxy";

/**
 * POST /api/auth/reset-password
 * Proxy para o backend Fastify: POST /auth/reset-password
 */
export async function POST(request: NextRequest) {
  return proxyToBackend({
    path: "/auth/reset-password",
    method: "POST",
    request,
  });
}
