import { NextResponse } from "next/server";

/**
 * POST /api/auth/logout
 * Encerra a sessao do usuario removendo o refresh token.
 * Implementacao mock para demonstracao do template.
 */
export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set("refresh-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
