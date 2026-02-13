import { type SQL, sql } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

/**
 * Full-text search utilities using PostgreSQL's native tsvector/tsquery.
 *
 * These helpers generate raw SQL fragments that integrate with Drizzle ORM
 * queries for high-performance full-text search with ranking and highlighting.
 *
 * @example
 * ```ts
 * // In a query
 * const searchCondition = buildFullTextSearch("john doe", [users.name, users.email]);
 * const results = await db
 *   .select({
 *     ...getTableColumns(users),
 *     rank: fullTextRank([users.name, users.email], "john doe"),
 *   })
 *   .from(users)
 *   .where(searchCondition)
 *   .orderBy(desc(fullTextRank([users.name, users.email], "john doe")));
 * ```
 */

/**
 * Default PostgreSQL text search configuration.
 * 'simple' works well for most languages and doesn't strip stop words.
 * Use 'english', 'portuguese', etc. for language-specific stemming.
 */
const DEFAULT_CONFIG = "simple";

/**
 * Sanitize a search term for use in tsquery.
 * Escapes special characters and converts spaces to AND operators.
 */
function sanitizeSearchTerm(term: string): string {
  // Remove special tsquery characters
  const cleaned = term
    .replace(/[&|!():*<>'"\\]/g, " ")
    .trim()
    .replace(/\s+/g, " ");

  if (!cleaned) return "";

  // Split into words and join with AND operator, add prefix matching
  const words = cleaned.split(" ").filter(Boolean);
  return words.map((w) => `${w}:*`).join(" & ");
}

/**
 * Build a tsvector SQL expression from multiple columns.
 *
 * @param columns - Columns to include in the search vector
 * @param config - PostgreSQL text search configuration (default: 'simple')
 *
 * @example
 * ```ts
 * const vector = buildSearchVector([users.name, users.email]);
 * // → to_tsvector('simple', coalesce("name", '') || ' ' || coalesce("email", ''))
 * ```
 */
export function buildSearchVector(
  columns: PgColumn[],
  config: string = DEFAULT_CONFIG,
): SQL {
  if (columns.length === 0) {
    throw new Error("At least one column is required for search vector");
  }

  const parts = columns.map((col) => sql`coalesce(${col}::text, '')`);

  // Join columns with space separator
  let combined = parts[0]!;
  for (let i = 1; i < parts.length; i++) {
    combined = sql`${combined} || ' ' || ${parts[i]}`;
  }

  return sql`to_tsvector(${sql.raw(`'${config}'`)}, ${combined})`;
}

/**
 * Build a tsquery SQL expression from a search term.
 *
 * @param term - User search input
 * @param config - PostgreSQL text search configuration (default: 'simple')
 *
 * @example
 * ```ts
 * const query = buildSearchQuery("john doe");
 * // → to_tsquery('simple', 'john:* & doe:*')
 * ```
 */
export function buildSearchQuery(
  term: string,
  config: string = DEFAULT_CONFIG,
): SQL {
  const sanitized = sanitizeSearchTerm(term);
  if (!sanitized) return sql`to_tsquery(${sql.raw(`'${config}'`)}, '')`;

  return sql`to_tsquery(${sql.raw(`'${config}'`)}, ${sanitized})`;
}

/**
 * Build a full-text search WHERE condition.
 * Returns a SQL fragment that can be used in `.where()`.
 *
 * @param term - User search input
 * @param columns - Columns to search across
 * @param config - PostgreSQL text search configuration
 *
 * @example
 * ```ts
 * const where = buildFullTextSearch("john", [users.name, users.email]);
 * const results = await db.select().from(users).where(where);
 * ```
 */
export function buildFullTextSearch(
  term: string | undefined,
  columns: PgColumn[],
  config: string = DEFAULT_CONFIG,
): SQL | undefined {
  if (!term || !term.trim() || columns.length === 0) return undefined;

  const vector = buildSearchVector(columns, config);
  const query = buildSearchQuery(term, config);

  return sql`${vector} @@ ${query}`;
}

/**
 * Build a full-text search rank expression for ordering.
 * Higher rank = better match. Use with `desc()` for ordering.
 *
 * @example
 * ```ts
 * const rank = fullTextRank([users.name, users.email], "john");
 * const results = await db
 *   .select({ id: users.id, rank })
 *   .from(users)
 *   .where(buildFullTextSearch("john", [users.name, users.email]))
 *   .orderBy(desc(rank));
 * ```
 */
export function fullTextRank(
  columns: PgColumn[],
  term: string,
  config: string = DEFAULT_CONFIG,
): SQL<number> {
  const vector = buildSearchVector(columns, config);
  const query = buildSearchQuery(term, config);

  return sql<number>`ts_rank(${vector}, ${query})`;
}

/**
 * Build a headline (highlighted matches) expression.
 * Returns the text with matching terms wrapped in <b> tags.
 *
 * @example
 * ```ts
 * const headline = fullTextHeadline(users.name, "john");
 * // → ts_headline('simple', "name", to_tsquery('simple', 'john:*'))
 * // Result: "<b>John</b> Doe"
 * ```
 */
export function fullTextHeadline(
  column: PgColumn,
  term: string,
  config: string = DEFAULT_CONFIG,
): SQL<string> {
  const query = buildSearchQuery(term, config);

  return sql<string>`ts_headline(
    ${sql.raw(`'${config}'`)},
    coalesce(${column}::text, ''),
    ${query},
    'StartSel=<b>, StopSel=</b>, MaxWords=50, MinWords=20'
  )`;
}
