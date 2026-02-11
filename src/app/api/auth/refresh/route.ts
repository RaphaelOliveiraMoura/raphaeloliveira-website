import { NextRequest, NextResponse } from "next/server";

const MOCK_ACCESS_TOKEN = "mock-access-token-core-stack";

/**
 * POST /api/auth/refresh
 * Gera um novo access token a partir do refresh token (cookie httpOnly).
 * Implementacao mock para demonstracao do template.
 */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh-token")?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { error: "No refresh token" },
      { status: 401 }
    );
  }

  // Mock: valida o refresh token
  if (refreshToken !== "mock-refresh-token") {
    return NextResponse.json(
      { error: "Invalid refresh token" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    accessToken: MOCK_ACCESS_TOKEN,
  });
}
