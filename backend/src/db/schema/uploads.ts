import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const uploads = pgTable("uploads", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  originalName: varchar("original_name", { length: 500 }).notNull(),
  contentType: varchar("content_type", { length: 255 }).notNull(),
  size: integer("size").notNull(),
  uploadedBy: uuid("uploaded_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Upload = typeof uploads.$inferSelect;
export type NewUpload = typeof uploads.$inferInsert;
