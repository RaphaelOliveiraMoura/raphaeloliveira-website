/**
 * HTML entity map for XSS-sensitive characters.
 */
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#96;",
};

const HTML_ENTITY_REGEX = /[&<>"'`/]/g;

/**
 * Escape HTML entities in a string to prevent XSS attacks.
 *
 * @example
 * ```ts
 * escapeHtml('<script>alert("xss")</script>');
 * // '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
 * ```
 */
export function escapeHtml(input: string): string {
  return input.replace(
    HTML_ENTITY_REGEX,
    (char) => HTML_ENTITIES[char] ?? char,
  );
}

/**
 * Strip all HTML tags from a string.
 *
 * @example
 * ```ts
 * stripHtml('<p>Hello <b>World</b></p>');
 * // 'Hello World'
 * ```
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

/**
 * Sanitize a string by stripping HTML tags and trimming whitespace.
 * Suitable for general text input fields.
 *
 * @example
 * ```ts
 * sanitizeText('  <script>alert("xss")</script>Hello  ');
 * // 'alert("xss")Hello'
 * ```
 */
export function sanitizeText(input: string): string {
  return stripHtml(input).trim();
}

/**
 * Recursively sanitize all string values in an object.
 * Useful for sanitizing entire request bodies.
 *
 * @example
 * ```ts
 * sanitizeObject({ name: '<b>John</b>', nested: { bio: '<script>x</script>' } });
 * // { name: 'John', nested: { bio: 'x' } }
 * ```
 */
export function sanitizeObject<T>(obj: T): T {
  if (typeof obj === "string") {
    return sanitizeText(obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject) as T;
  }

  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = sanitizeObject(value);
    }
    return result as T;
  }

  return obj;
}

/**
 * Remove null bytes from a string (prevents attacks on C-based backends).
 */
export function stripNullBytes(input: string): string {
  return input.replace(/\0/g, "");
}

/**
 * Sanitize a filename to prevent path traversal attacks.
 *
 * @example
 * ```ts
 * sanitizeFilename('../../../etc/passwd');
 * // 'etc-passwd'
 * sanitizeFilename('my file (1).pdf');
 * // 'my-file-1.pdf'
 * ```
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[/\\]/g, "-") // Path separators
    .replace(/\.\./g, "") // Directory traversal
    .replace(/[^a-zA-Z0-9._-]/g, "-") // Non-safe chars
    .replace(/-+/g, "-") // Collapse hyphens
    .replace(/^-|-$/g, ""); // Trim hyphens
}
