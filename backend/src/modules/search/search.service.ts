import { desc, sql } from "drizzle-orm";

import { db } from "../../db/index";
import {
  auditLogs,
  featureFlags,
  notifications,
  users,
  webhooks,
} from "../../db/schema/index";
import {
  buildFullTextSearch,
  buildSearchQuery,
  buildSearchVector,
} from "../../lib/full-text-search";
import { logger } from "../../lib/logger";
import type {
  SearchableEntity,
  SearchResponse,
  SearchResultItem,
} from "./search.types";

const log = logger.child({ module: "search" });

/**
 * Unified search service using a registry pattern.
 *
 * Entities register themselves and the service queries all
 * registered entities in parallel using PostgreSQL full-text search.
 */
export class SearchService {
  private entities = new Map<string, SearchableEntity>();

  constructor() {
    this.registerDefaultEntities();
  }

  /**
   * Register a searchable entity.
   */
  register(entity: SearchableEntity): void {
    this.entities.set(entity.type, entity);
    log.debug({ type: entity.type }, "Search entity registered");
  }

  /**
   * Get all registered entity type names.
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.entities.keys());
  }

  /**
   * Execute a unified search across registered entities.
   *
   * @param query - Search term.
   * @param types - Optional filter to search only specific entity types.
   * @param limit - Maximum results per entity type.
   */
  async search(
    query: string,
    types?: string[],
    limit = 10,
  ): Promise<SearchResponse> {
    const entitiesToSearch = types
      ? Array.from(this.entities.values()).filter((e) => types.includes(e.type))
      : Array.from(this.entities.values());

    if (entitiesToSearch.length === 0) {
      return { results: [], total: 0 };
    }

    // Search all entities in parallel
    const searchPromises = entitiesToSearch.map((entity) =>
      this.searchEntity(entity, query, limit).catch((err) => {
        log.error(
          { type: entity.type, error: err },
          "Search failed for entity",
        );
        return [] as SearchResultItem[];
      }),
    );

    const resultArrays = await Promise.all(searchPromises);
    const allResults = resultArrays.flat();

    // Sort by rank (descending) and limit total
    allResults.sort((a, b) => b.rank - a.rank);
    const limited = allResults.slice(0, limit);

    return {
      results: limited,
      total: allResults.length,
    };
  }

  /**
   * Search a single entity type using full-text search.
   */
  private async searchEntity(
    entity: SearchableEntity,
    query: string,
    limit: number,
  ): Promise<SearchResultItem[]> {
    const searchCondition = buildFullTextSearch(query, entity.searchColumns);

    if (!searchCondition) return [];

    const vector = buildSearchVector(entity.searchColumns);
    const tsquery = buildSearchQuery(query);
    const rankExpr = sql<number>`ts_rank(${vector}, ${tsquery})`;

    const selectFields: Record<string, unknown> = {
      id: entity.idColumn,
      title: entity.titleColumn,
      rank: rankExpr,
    };

    if (entity.subtitleColumn) {
      selectFields.subtitle = entity.subtitleColumn;
    }

    const rows = await db
      .select(
        selectFields as {
          id: typeof entity.idColumn;
          title: typeof entity.titleColumn;
          rank: ReturnType<typeof sql<number>>;
          subtitle?: typeof entity.subtitleColumn;
        },
      )
      .from(entity.table)
      .where(searchCondition)
      .orderBy(desc(rankExpr))
      .limit(limit);

    return rows.map((row) => ({
      type: entity.type,
      id: String(row.id),
      title: String(row.title),
      subtitle: row.subtitle ? String(row.subtitle) : null,
      rank: Number(row.rank) || 0,
    }));
  }

  /**
   * Register the default searchable entities.
   */
  private registerDefaultEntities(): void {
    this.register({
      type: "users",
      table: users,
      idColumn: users.id,
      searchColumns: [users.name, users.email],
      titleColumn: users.name,
      subtitleColumn: users.email,
    });

    this.register({
      type: "notifications",
      table: notifications,
      idColumn: notifications.id,
      searchColumns: [notifications.title],
      titleColumn: notifications.title,
    });

    this.register({
      type: "audit",
      table: auditLogs,
      idColumn: auditLogs.id,
      searchColumns: [auditLogs.action],
      titleColumn: auditLogs.action,
      permission: "audit.read",
    });

    this.register({
      type: "feature-flags",
      table: featureFlags,
      idColumn: featureFlags.id,
      searchColumns: [featureFlags.key],
      titleColumn: featureFlags.key,
    });

    this.register({
      type: "webhooks",
      table: webhooks,
      idColumn: webhooks.id,
      searchColumns: [webhooks.url],
      titleColumn: webhooks.url,
    });
  }
}
