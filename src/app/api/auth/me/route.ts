import { NextRequest, NextResponse } from "next/server";

import type { User } from "@/types/auth";

/**
 * GET /api/auth/me
 * Retorna o usuario autenticado com base no token Bearer.
 * Implementacao mock para demonstracao do template.
 */
export async function GET(request: NextRequest) {
  const authorization = request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authorization.slice(7);

  if (!token || token === "invalid") {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Mock: retorna um usuario baseado no token
  const user: User = {
    id: "1",
    name: "Demo User",
    email: "demo@corestack.dev",
    role: "admin",
    avatar: undefined,
  };

  return NextResponse.json(user);
}
