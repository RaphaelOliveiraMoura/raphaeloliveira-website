interface FileValidation {
  maxSize?: number; // bytes
  allowedTypes?: string[]; // mime types
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(
  file: File,
  options: FileValidation = {}
): ValidationResult {
  if (options.maxSize && file.size > options.maxSize) {
    const maxMb = (options.maxSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Arquivo excede o tamanho máximo de ${maxMb}MB`,
    };
  }
  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido: ${file.type}`,
    };
  }
  return { valid: true };
}
