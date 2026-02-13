import type { PgColumn, PgTable } from "drizzle-orm/pg-core";

/**
 * Configuration for a searchable entity in the unified search system.
 */
export interface SearchableEntity {
  /** Unique type identifier (e.g., "users", "notifications"). */
  type: string;
  /** Drizzle table reference. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: PgTable<any>;
  /** ID column for the entity. */
  idColumn: PgColumn;
  /** Columns to include in full-text search. */
  searchColumns: PgColumn[];
  /** Column to use as the result title. */
  titleColumn: PgColumn;
  /** Optional column to use as the result subtitle. */
  subtitleColumn?: PgColumn;
  /** Optional permission required to search this entity (e.g., "audit.read"). */
  permission?: string;
}

/**
 * A single search result item.
 */
export interface SearchResultItem {
  /** Entity type (e.g., "users", "notifications"). */
  type: string;
  /** Entity ID. */
  id: string;
  /** Primary display text. */
  title: string;
  /** Secondary display text. */
  subtitle: string | null;
  /** Full-text search rank score. */
  rank: number;
}

/**
 * Response from the unified search endpoint.
 */
export interface SearchResponse {
  results: SearchResultItem[];
  total: number;
}
