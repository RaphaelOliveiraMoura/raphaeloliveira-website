import type { AuditLog } from "../../db/schema/index";
import {
  getOffset,
  paginate,
  type PaginatedResponse,
} from "../../lib/pagination";
import type { Transaction } from "../../lib/transaction";
import { AuditRepository } from "./audit.repository";
import type { ListAuditLogsQuery } from "./audit.schemas";

export interface CreateAuditLogInput {
  action: string;
  actorId?: string;
  actorEmail?: string;
  resourceType?: string;
  resourceId?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

function toDTO(log: AuditLog) {
  return {
    id: log.id,
    action: log.action,
    actorId: log.actorId,
    actorEmail: log.actorEmail,
    resourceType: log.resourceType,
    resourceId: log.resourceId,
    changes: log.changes,
    metadata: log.metadata,
    ip: log.ip,
    userAgent: log.userAgent,
    createdAt: log.createdAt.toISOString(),
  };
}

export class AuditService {
  private repository = new AuditRepository();

  /**
   * Create an audit log entry.
   */
  async log(input: CreateAuditLogInput, tx?: Transaction) {
    await this.repository.log(input, tx);
  }

  /**
   * List audit logs with pagination and filters.
   */
  async list(
    query: ListAuditLogsQuery,
  ): Promise<PaginatedResponse<ReturnType<typeof toDTO>>> {
    const offset = getOffset(query.page, query.limit);

    const { data, total } = await this.repository.findManyWithFilters({
      offset,
      limit: query.limit,
      action: query.action,
      actorId: query.actorId,
      resourceType: query.resourceType,
      resourceId: query.resourceId,
      search: query.search,
    });

    return paginate(data.map(toDTO), total, query.page, query.limit);
  }
}
