/**
 * Generate a URL-friendly slug from a string.
 *
 * - Converts to lowercase
 * - Replaces accented characters with ASCII equivalents
 * - Replaces non-alphanumeric characters with hyphens
 * - Collapses multiple hyphens
 * - Trims leading/trailing hyphens
 *
 * @example
 * ```ts
 * slugify("Hello World!");       // "hello-world"
 * slugify("Café & Résumé");     // "cafe-resume"
 * slugify("  My  Post  Title "); // "my-post-title"
 * ```
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Non-alphanumeric → hyphen
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-|-$/g, ""); // Trim leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a random suffix.
 *
 * @example
 * ```ts
 * uniqueSlug("My Post");  // "my-post-a3f2b1"
 * ```
 */
export function uniqueSlug(input: string, suffixLength = 6): string {
  const base = slugify(input);
  const suffix = Math.random()
    .toString(36)
    .substring(2, 2 + suffixLength);
  return `${base}-${suffix}`;
}
