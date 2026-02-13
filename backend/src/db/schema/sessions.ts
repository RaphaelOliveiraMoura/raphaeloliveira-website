import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { refreshTokens } from "./refresh-tokens";
import { users } from "./users";

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  refreshTokenId: uuid("refresh_token_id").references(() => refreshTokens.id, {
    onDelete: "set null",
  }),
  ip: varchar("ip", { length: 45 }),
  userAgent: text("user_agent"),
  deviceName: varchar("device_name", { length: 255 }),
  lastActiveAt: timestamp("last_active_at", {
    withTimezone: true,
  }).defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
