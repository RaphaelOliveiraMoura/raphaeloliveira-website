import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";

export async function generateCsrfToken(): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const cookieStore = await cookies();
  const hashed = createHash("sha256").update(token).digest("hex");

  cookieStore.set("csrf_token", hashed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 3600,
  });

  return token;
}

export async function validateCsrfToken(token: string): Promise<boolean> {
  const cookieStore = await cookies();
  const stored = cookieStore.get("csrf_token")?.value;

  if (!stored) return false;

  const hashed = createHash("sha256").update(token).digest("hex");
  return hashed === stored;
}
