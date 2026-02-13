import { NextRequest } from "next/server";

import { proxyToBackend } from "@/app/api/backend-proxy";

/**
 * POST /api/auth/login
 * Proxy para o backend Fastify: POST /auth/login
 */
export async function POST(request: NextRequest) {
  return proxyToBackend({
    path: "/auth/login",
    method: "POST",
    request,
  });
}
