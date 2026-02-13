import { and, count, eq, ilike, or, type SQL } from "drizzle-orm";

import { db } from "../../db/index";
import { type NewUser, type User, users } from "../../db/schema/index";

export class UsersRepository {
  /**
   * Find a user by ID.
   */
  async findById(id: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user;
  }

  /**
   * Find a user by email.
   */
  async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user;
  }

  /**
   * List users with pagination, optional search and role filter.
   */
  async findMany(options: {
    offset: number;
    limit: number;
    search?: string;
    role?: string;
  }): Promise<{ data: User[]; total: number }> {
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

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, [countResult]] = await Promise.all([
      db
        .select()
        .from(users)
        .where(where)
        .limit(options.limit)
        .offset(options.offset)
        .orderBy(users.createdAt),
      db.select({ count: count() }).from(users).where(where),
    ]);

    return { data, total: countResult?.count ?? 0 };
  }

  /**
   * Create a new user.
   */
  async create(data: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user!;
  }

  /**
   * Update a user by ID.
   */
  async update(
    id: string,
    data: Partial<Pick<User, "name" | "email" | "role">>,
  ): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  /**
   * Delete a user by ID.
   */
  async delete(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }
}
