import { NextRequest, NextResponse } from "next/server";

import type { User } from "@/types/auth";

const DEMO_EMAIL = "demo@corestack.dev";
const DEMO_PASSWORD = "password123";
const MOCK_ACCESS_TOKEN = "mock-access-token-core-stack";

/**
 * POST /api/auth/login
 * Autentica o usuario com email e senha.
 * Implementacao mock para demonstracao do template.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Mock: aceita apenas credenciais de demo
    if (body.email !== DEMO_EMAIL || body.password !== DEMO_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user: User = {
      id: "1",
      name: "Demo User",
      email: DEMO_EMAIL,
      role: "admin",
      avatar: undefined,
    };

    const response = NextResponse.json({
      user,
      accessToken: MOCK_ACCESS_TOKEN,
    });

    // Seta cookie httpOnly para refresh token
    response.cookies.set("refresh-token", "mock-refresh-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
