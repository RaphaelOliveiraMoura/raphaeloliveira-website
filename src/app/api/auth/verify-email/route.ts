import { NextRequest } from "next/server";

import { proxyToBackend } from "@/app/api/backend-proxy";

/**
 * POST /api/auth/verify-email
 * Proxy para o backend Fastify: POST /auth/verify-email
 */
export async function POST(request: NextRequest) {
  return proxyToBackend({
    path: "/auth/verify-email",
    method: "POST",
    request,
  });
}
