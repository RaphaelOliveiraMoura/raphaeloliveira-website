import { eq } from "drizzle-orm";

import { db } from "../../db/index";
import type {
  FeatureFlag,
  NewFeatureFlag,
} from "../../db/schema/feature-flags";
import { featureFlags } from "../../db/schema/feature-flags";

export class FeatureFlagsRepository {
  async findAll(): Promise<FeatureFlag[]> {
    return db.select().from(featureFlags);
  }

  async findById(id: string): Promise<FeatureFlag | undefined> {
    const [flag] = await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.id, id))
      .limit(1);
    return flag;
  }

  async findByKey(key: string): Promise<FeatureFlag | undefined> {
    const [flag] = await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.key, key))
      .limit(1);
    return flag;
  }

  async create(data: NewFeatureFlag): Promise<FeatureFlag> {
    const [flag] = await db.insert(featureFlags).values(data).returning();
    return flag!;
  }

  async update(
    id: string,
    data: Partial<Pick<FeatureFlag, "description" | "enabled" | "conditions">>,
  ): Promise<FeatureFlag | undefined> {
    const [flag] = await db
      .update(featureFlags)
      .set(data)
      .where(eq(featureFlags.id, id))
      .returning();
    return flag;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(featureFlags)
      .where(eq(featureFlags.id, id))
      .returning({ id: featureFlags.id });
    return result.length > 0;
  }
}
