import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./users";

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: text("token").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  revoked: boolean("revoked").notNull().default(false),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
