interface FileValidation {
  maxSize?: number; // bytes
  allowedTypes?: string[]; // mime types
}

interface ValidationResult {
  valid: boolean;
  /** Chave i18n ou mensagem tecnica para o erro */
  errorKey?: string;
  /** Parametros para interpolacao na mensagem i18n */
  errorParams?: Record<string, string | number>;
}

export function validateFile(
  file: File,
  options: FileValidation = {},
): ValidationResult {
  if (options.maxSize && file.size > options.maxSize) {
    const maxMb = (options.maxSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      errorKey: "fileUpload.maxSizeExceeded",
      errorParams: { maxMb },
    };
  }
  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      errorKey: "fileUpload.invalidType",
      errorParams: { type: file.type },
    };
  }
  return { valid: true };
}
