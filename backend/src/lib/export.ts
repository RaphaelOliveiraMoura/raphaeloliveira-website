import { Readable } from "node:stream";

import type { FastifyReply } from "fastify";

/**
 * Supported export formats.
 */
export type ExportFormat = "csv" | "json";

/**
 * Column definition for data export.
 */
export interface ExportColumn<T> {
  /** Key to extract from the row (supports dot notation for nested access). */
  key: keyof T | (string & {});
  /** Human-readable header name. */
  header: string;
  /** Optional transform function for formatting cell values. */
  transform?: (value: unknown, row: T) => string;
}

/**
 * Options for data export.
 */
export interface ExportOptions<T> {
  /** Export format. */
  format: ExportFormat;
  /** Column definitions. */
  columns: ExportColumn<T>[];
  /** Filename for Content-Disposition header (without extension). */
  filename?: string;
  /** CSV delimiter character (default: ","  ). */
  delimiter?: string;
}

/**
 * Escape a CSV cell value according to RFC 4180.
 *
 * Wraps in double quotes if the value contains:
 * - The delimiter character
 * - Double quotes
 * - Newlines
 */
function escapeCsvCell(value: string, delimiter: string): string {
  if (
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Get a nested value from an object using dot notation.
 */
function getNestedValue(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined) return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

/**
 * Extract a cell value from a row using a column definition.
 */
function getCellValue<T>(row: T, column: ExportColumn<T>): string {
  const rawValue = getNestedValue(row, column.key as string);

  if (column.transform) {
    return column.transform(rawValue, row);
  }

  if (rawValue === null || rawValue === undefined) return "";
  if (rawValue instanceof Date) return rawValue.toISOString();
  if (typeof rawValue === "object") return JSON.stringify(rawValue);
  return String(rawValue);
}

/**
 * Generate CSV content from data rows.
 */
function* generateCsv<T>(
  data: T[],
  columns: ExportColumn<T>[],
  delimiter: string,
): Generator<string> {
  // Header row
  yield columns.map((c) => escapeCsvCell(c.header, delimiter)).join(delimiter) +
    "\n";

  // Data rows
  for (const row of data) {
    yield columns
      .map((c) => escapeCsvCell(getCellValue(row, c), delimiter))
      .join(delimiter) + "\n";
  }
}

/**
 * Generate JSON content from data rows.
 */
function generateJson<T>(data: T[], columns: ExportColumn<T>[]): string {
  const rows = data.map((row) => {
    const obj: Record<string, string> = {};
    for (const col of columns) {
      obj[col.header] = getCellValue(row, col);
    }
    return obj;
  });

  return JSON.stringify(rows, null, 2);
}

/**
 * Create a Readable stream from export data.
 *
 * @example
 * ```ts
 * const stream = createExportStream(users, {
 *   format: "csv",
 *   columns: [
 *     { key: "name", header: "Name" },
 *     { key: "email", header: "Email" },
 *     { key: "createdAt", header: "Created", transform: (v) => new Date(v as string).toLocaleDateString() },
 *   ],
 * });
 * ```
 */
export function createExportStream<T>(
  data: T[],
  options: ExportOptions<T>,
): Readable {
  const { format, columns, delimiter = "," } = options;

  if (format === "csv") {
    const generator = generateCsv(data, columns, delimiter);

    return new Readable({
      read() {
        const { value, done } = generator.next();
        if (done) {
          this.push(null);
        } else {
          this.push(value);
        }
      },
    });
  }

  // JSON: generate all at once
  const json = generateJson(data, columns);
  return Readable.from([json]);
}

/**
 * Content type mapping for export formats.
 */
const CONTENT_TYPES: Record<ExportFormat, string> = {
  csv: "text/csv; charset=utf-8",
  json: "application/json; charset=utf-8",
};

/**
 * File extension mapping for export formats.
 */
const EXTENSIONS: Record<ExportFormat, string> = {
  csv: "csv",
  json: "json",
};

/**
 * Send export data as a Fastify response with proper headers.
 *
 * Sets Content-Type, Content-Disposition, and streams the data.
 *
 * @example
 * ```ts
 * // In a Fastify route handler:
 * server.get("/users/export", async (request, reply) => {
 *   const users = await usersService.listAll();
 *   await sendExport(reply, users, {
 *     format: "csv",
 *     filename: "users",
 *     columns: [
 *       { key: "name", header: "Name" },
 *       { key: "email", header: "Email" },
 *     ],
 *   });
 * });
 * ```
 */
export async function sendExport<T>(
  reply: FastifyReply,
  data: T[],
  options: ExportOptions<T>,
): Promise<void> {
  const { format, filename = "export" } = options;
  const ext = EXTENSIONS[format];
  const contentType = CONTENT_TYPES[format];
  const fullFilename = `${filename}.${ext}`;

  reply.header("Content-Type", contentType);
  reply.header("Content-Disposition", `attachment; filename="${fullFilename}"`);

  const stream = createExportStream(data, options);
  return reply.send(stream);
}
