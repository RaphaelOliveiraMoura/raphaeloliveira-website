import {
  boolean,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Conditions for evaluating a feature flag.
 * A flag is enabled if ALL specified conditions are met.
 */
export interface FlagConditions {
  /** Only enable for specific roles. */
  roles?: string[];
  /** Only enable for specific user IDs. */
  userIds?: string[];
  /** Enable for a percentage of users (0-100). */
  percentage?: number;
  /** Only enable in specific environments. */
  environments?: string[];
}

export const featureFlags = pgTable("feature_flags", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  description: varchar("description", { length: 500 }),
  enabled: boolean("enabled").notNull().default(false),
  conditions: jsonb("conditions").$type<FlagConditions>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type NewFeatureFlag = typeof featureFlags.$inferInsert;
