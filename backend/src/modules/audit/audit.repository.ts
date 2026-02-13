import { desc } from "drizzle-orm";

import { auditLogs, type NewAuditLog } from "../../db/schema/index";
import {
  BaseRepository,
  type FindManyOptions,
} from "../../lib/base-repository";
import {
  buildFilters,
  buildSearch,
  combineConditions,
  type FilterDefinition,
} from "../../lib/query-builder";
import type { Transaction } from "../../lib/transaction";

export class AuditRepository extends BaseRepository<typeof auditLogs> {
  constructor() {
    super(auditLogs);
  }

  /**
   * Log an audit entry.
   */
  async log(entry: NewAuditLog, tx?: Transaction) {
    return this.create(entry, tx);
  }

  /**
   * List audit logs with filters (action, actor, resource).
   */
  async findManyWithFilters(
    options: {
      offset: number;
      limit: number;
      action?: string;
      actorId?: string;
      resourceType?: string;
      resourceId?: string;
      search?: string;
    },
    tx?: Transaction,
  ) {
    const filters: FilterDefinition[] = [];

    if (options.action) {
      filters.push({
        column: auditLogs.action,
        operator: "eq",
        value: options.action,
      });
    }

    if (options.actorId) {
      filters.push({
        column: auditLogs.actorId,
        operator: "eq",
        value: options.actorId,
      });
    }

    if (options.resourceType) {
      filters.push({
        column: auditLogs.resourceType,
        operator: "eq",
        value: options.resourceType,
      });
    }

    if (options.resourceId) {
      filters.push({
        column: auditLogs.resourceId,
        operator: "eq",
        value: options.resourceId,
      });
    }

    const filterWhere = buildFilters(filters);
    const searchWhere = buildSearch(options.search, [
      auditLogs.action,
      auditLogs.actorEmail,
    ]);

    const where = combineConditions(filterWhere, searchWhere);

    const findOptions: FindManyOptions = {
      offset: options.offset,
      limit: options.limit,
      where,
      orderBy: desc(auditLogs.createdAt),
    };

    return this.findMany(findOptions, tx);
  }
}
