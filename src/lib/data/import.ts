import type { z } from "zod";

export interface CsvParseOptions {
  /** Delimitador (default: ",") */
  delimiter?: string;
  /** Primeira linha e header (default: true) */
  hasHeader?: boolean;
  /** Encoding do arquivo (default: "utf-8") */
  encoding?: string;
  /** Numero maximo de linhas a processar (sem limite se undefined) */
  maxRows?: number;
}

export interface CsvParseResult<T> {
  data: T[];
  headers: string[];
  errors: CsvRowError[];
  totalRows: number;
}

export interface CsvRowError {
  row: number;
  column?: string;
  message: string;
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i] as string;

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Parse de conteudo CSV em array de objetos.
 * Suporta campos com aspas e valores multiword.
 */
export function parseCsv<
  T extends Record<string, string> = Record<string, string>,
>(content: string, options: CsvParseOptions = {}): CsvParseResult<T> {
  const { delimiter = ",", hasHeader = true, maxRows } = options;

  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return { data: [], headers: [], errors: [], totalRows: 0 };
  }

  let headers: string[];
  let dataStartIndex: number;

  if (hasHeader) {
    headers = parseCsvLine(lines[0] as string, delimiter);
    dataStartIndex = 1;
  } else {
    const firstLine = parseCsvLine(lines[0] as string, delimiter);
    headers = firstLine.map((_, i) => `column_${i}`);
    dataStartIndex = 0;
  }

  const data: T[] = [];
  const errors: CsvRowError[] = [];
  const limit = maxRows
    ? Math.min(dataStartIndex + maxRows, lines.length)
    : lines.length;

  for (let i = dataStartIndex; i < limit; i++) {
    const values = parseCsvLine(lines[i] as string, delimiter);
    const row: Record<string, string> = {};

    if (values.length !== headers.length) {
      errors.push({
        row: i + 1,
        message: `Expected ${headers.length} columns, got ${values.length}`,
      });
      continue;
    }

    for (let j = 0; j < headers.length; j++) {
      row[headers[j] as string] = values[j] as string;
    }

    data.push(row as T);
  }

  return {
    data,
    headers,
    errors,
    totalRows: lines.length - dataStartIndex,
  };
}

/**
 * Parse de CSV com validacao via schema Zod.
 * Valida cada linha e separa dados validos de erros.
 */
export function parseCsvWithValidation<T>(
  content: string,
  schema: z.ZodType<T>,
  options: CsvParseOptions = {},
): CsvParseResult<T> {
  const raw = parseCsv(content, options);
  const validData: T[] = [];
  const errors: CsvRowError[] = [...raw.errors];

  for (let i = 0; i < raw.data.length; i++) {
    const result = schema.safeParse(raw.data[i]);
    if (result.success) {
      validData.push(result.data);
    } else {
      const issues = result.error?.issues ?? [];
      for (const issue of issues) {
        errors.push({
          row: i + 2, // +1 header, +1 para 1-indexed
          column: issue.path.map(String).join("."),
          message: issue.message,
        });
      }
    }
  }

  return {
    data: validData,
    headers: raw.headers,
    errors,
    totalRows: raw.totalRows,
  };
}

/**
 * Le um File como string (para uso com FileUpload).
 */
export function readFileAsText(
  file: File,
  encoding = "utf-8",
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file, encoding);
  });
}

/**
 * Parse de JSON file com validacao via schema Zod.
 */
export function parseJsonWithValidation<T>(
  content: string,
  schema: z.ZodType<T>,
): { data: T | null; error: string | null } {
  try {
    const parsed: unknown = JSON.parse(content);
    const result = schema.safeParse(parsed);
    if (result.success) {
      return { data: result.data, error: null };
    }
    const messages = result.error?.issues.map((i) => i.message).join("; ");
    return { data: null, error: messages ?? "Validation failed" };
  } catch {
    return { data: null, error: "Invalid JSON format" };
  }
}
