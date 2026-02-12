import { AppError } from "./base";

export interface FieldError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Erro de validacao com detalhes por campo.
 */
export class ValidationError extends AppError {
  readonly fieldErrors: FieldError[];

  constructor(
    fieldErrors: FieldError[],
    message = "Validation failed",
    options?: { cause?: unknown; context?: Record<string, unknown> },
  ) {
    super(message, "VALIDATION_ERROR", options);
    this.name = "ValidationError";
    this.fieldErrors = fieldErrors;
  }

  /**
   * Retorna um mapa field -> messages para facil integracao com formularios.
   */
  toFieldMap(): Record<string, string[]> {
    const map: Record<string, string[]> = {};
    for (const err of this.fieldErrors) {
      if (!map[err.field]) map[err.field] = [];
      (map[err.field] as string[]).push(err.message);
    }
    return map;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      fieldErrors: this.fieldErrors,
    };
  }
}
