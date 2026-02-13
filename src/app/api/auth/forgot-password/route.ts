import { NextRequest } from "next/server";

import { proxyToBackend } from "@/app/api/backend-proxy";

/**
 * POST /api/auth/forgot-password
 * Proxy para o backend Fastify: POST /auth/forgot-password
 */
export async function POST(request: NextRequest) {
  return proxyToBackend({
    path: "/auth/forgot-password",
    method: "POST",
    request,
  });
}
