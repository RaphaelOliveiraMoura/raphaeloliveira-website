import { desc, ilike } from "drizzle-orm";

import { uploads } from "../../db/schema/index";
import { BaseRepository } from "../../lib/base-repository";
import type { Transaction } from "../../lib/transaction";

export class UploadsRepository extends BaseRepository<typeof uploads> {
  constructor() {
    super(uploads);
  }

  /**
   * List uploads with optional search by filename.
   */
  async findManyWithFilters(
    options: {
      offset: number;
      limit: number;
      search?: string;
    },
    tx?: Transaction,
  ) {
    const searchWhere = options.search
      ? ilike(uploads.originalName, `%${options.search}%`)
      : undefined;

    return this.findMany(
      {
        offset: options.offset,
        limit: options.limit,
        where: searchWhere,
        orderBy: desc(uploads.createdAt),
      },
      tx,
    );
  }
}
