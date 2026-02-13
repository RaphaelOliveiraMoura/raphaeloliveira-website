import { NextRequest } from "next/server";

import { proxyToBackend } from "@/app/api/backend-proxy";

/**
 * POST /api/auth/register
 * Proxy para o backend Fastify: POST /auth/register
 */
export async function POST(request: NextRequest) {
  return proxyToBackend({
    path: "/auth/register",
    method: "POST",
    request,
  });
}
