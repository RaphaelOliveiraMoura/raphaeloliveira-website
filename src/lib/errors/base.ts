/**
 * Classe base para todos os erros do aplicativo.
 * Fornece estrutura padronizada com code, context e causa original.
 */
export class AppError extends Error {
  readonly code: string;
  readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code = "APP_ERROR",
    options?: { cause?: unknown; context?: Record<string, unknown> },
  ) {
    super(message, { cause: options?.cause });
    this.name = "AppError";
    this.code = code;
    this.context = options?.context;
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      ...(this.cause instanceof Error && {
        cause: { name: this.cause.name, message: this.cause.message },
      }),
    };
  }
}
