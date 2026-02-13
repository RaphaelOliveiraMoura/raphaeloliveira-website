import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_INTERNAL_URL || "http://localhost:3001";

interface ProxyOptions {
  /** Caminho no backend (ex: "/auth/login") */
  path: string;
  method: string;
  request: NextRequest;
  /** Se true, envia o body da request original */
  forwardBody?: boolean;
}

/**
 * Proxy generico para encaminhar requests do Next.js para o backend Fastify.
 * Encaminha headers de autorizacao, cookies e retorna Set-Cookie do backend.
 */
export async function proxyToBackend({
  path,
  method,
  request,
  forwardBody = true,
}: ProxyOptions): Promise<NextResponse> {
  const url = `${API_URL}${path}`;

  const headers: Record<string, string> = {};

  // Encaminhar Authorization header
  const authorization = request.headers.get("Authorization");
  if (authorization) {
    headers["Authorization"] = authorization;
  }

  // Encaminhar cookies (refresh-token)
  const cookieHeader = request.headers.get("Cookie");
  if (cookieHeader) {
    headers["Cookie"] = cookieHeader;
  }

  let body: string | undefined;
  if (forwardBody && method !== "GET" && method !== "HEAD") {
    try {
      const raw = await request.text();
      if (raw) body = raw;
    } catch {
      // Sem body
    }
  }

  // Enviar Content-Type apenas quando ha body
  if (body) {
    headers["Content-Type"] = "application/json";
  }

  const backendResponse = await fetch(url, {
    method,
    headers,
    body,
  });

  const data = await backendResponse.json().catch(() => ({}));

  const response = NextResponse.json(data, {
    status: backendResponse.status,
  });

  // Encaminhar Set-Cookie do backend para o cliente
  const setCookies = backendResponse.headers.getSetCookie();
  for (const cookie of setCookies) {
    response.headers.append("Set-Cookie", cookie);
  }

  return response;
}
