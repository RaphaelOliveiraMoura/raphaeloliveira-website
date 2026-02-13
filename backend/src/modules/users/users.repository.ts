import { asc, eq, ilike, or, type SQL } from "drizzle-orm";

import { type User, users } from "../../db/schema/index";
import { BaseRepository } from "../../lib/base-repository";
import type { Transaction } from "../../lib/transaction";

export class UsersRepository extends BaseRepository<typeof users> {
  constructor() {
    super(users, { softDelete: true });
  }

  /**
   * Find a user by email.
   */
  async findByEmail(
    email: string,
    tx?: Transaction,
  ): Promise<User | undefined> {
    return this.findOne(eq(users.email, email), tx);
  }

  /**
   * List users with pagination, optional search and role filter.
   */
  async findManyWithFilters(
    options: {
      offset: number;
      limit: number;
      search?: string;
      role?: string;
    },
    tx?: Transaction,
  ): Promise<{ data: User[]; total: number }> {
    const conditions: SQL[] = [];

    if (options.search) {
      const search = `%${options.search}%`;
      conditions.push(
        or(ilike(users.name, search), ilike(users.email, search))!,
      );
    }

    if (options.role) {
      conditions.push(eq(users.role, options.role as "admin" | "user"));
    }

    return this.findMany(
      {
        offset: options.offset,
        limit: options.limit,
        where:
          conditions.length > 0
            ? conditions.length === 1
              ? conditions[0]!
              : or(...conditions)!
            : undefined,
        orderBy: asc(users.createdAt),
      },
      tx,
    );
  }
}
