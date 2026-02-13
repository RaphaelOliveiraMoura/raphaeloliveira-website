import { and, desc, eq, isNull } from "drizzle-orm";

import { db } from "../../db/index";
import type { ApiKey, NewApiKey } from "../../db/schema/api-keys";
import { apiKeys } from "../../db/schema/api-keys";

export class ApiKeysRepository {
  async create(data: NewApiKey): Promise<ApiKey> {
    const [key] = await db.insert(apiKeys).values(data).returning();
    return key!;
  }

  async findActiveByUserId(userId: string): Promise<ApiKey[]> {
    return db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.userId, userId), isNull(apiKeys.revokedAt)))
      .orderBy(desc(apiKeys.createdAt));
  }

  async findByPrefix(prefix: string): Promise<ApiKey | undefined> {
    const [key] = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.prefix, prefix), isNull(apiKeys.revokedAt)))
      .limit(1);
    return key;
  }

  async findById(id: string): Promise<ApiKey | undefined> {
    const [key] = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.id, id))
      .limit(1);
    return key;
  }

  async revoke(id: string): Promise<void> {
    await db
      .update(apiKeys)
      .set({ revokedAt: new Date() })
      .where(eq(apiKeys.id, id));
  }

  async updateLastUsed(id: string): Promise<void> {
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, id));
  }
}
