import { AppError } from "./base";

export type AuthErrorCode =
  | "AUTH_UNAUTHENTICATED"
  | "AUTH_UNAUTHORIZED"
  | "AUTH_TOKEN_EXPIRED"
  | "AUTH_REFRESH_FAILED"
  | "AUTH_SESSION_INVALID";

/**
 * Erro de autenticacao/autorizacao.
 */
export class AuthError extends AppError {
  constructor(
    message: string,
    code: AuthErrorCode = "AUTH_UNAUTHENTICATED",
    options?: { cause?: unknown; context?: Record<string, unknown> },
  ) {
    super(message, code, options);
    this.name = "AuthError";
  }
}
