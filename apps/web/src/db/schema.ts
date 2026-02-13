import { pgTable, text, integer, real, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const fileStatusEnum = pgEnum("file_status", ["pending", "processing", "done", "failed"])
export const groupStatusEnum = pgEnum("group_status", ["pending", "approved", "rejected"])

export const groups = pgTable("groups", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  arranger: text("arranger").notNull().default(""),
  status: groupStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const files = pgTable("files", {
  id: text("id").primaryKey(),
  originalName: text("original_name").notNull(),
  storagePath: text("storage_path").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  status: fileStatusEnum("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  parsedTitle: text("parsed_title"),
  parsedArranger: text("parsed_arranger"),
  parsedInstrument: text("parsed_instrument"),
  parsedPart: integer("parsed_part"),
  parsedConfidence: real("parsed_confidence"),
  parsedRaw: text("parsed_raw"),
  parsedCredits: jsonb("parsed_credits"),
  parsedInstruments: jsonb("parsed_instruments"),
  groupId: text("group_id").references(() => groups.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const groupsRelations = relations(groups, ({ many }) => ({
  files: many(files),
}))

export const filesRelations = relations(files, ({ one }) => ({
  group: one(groups, {
    fields: [files.groupId],
    references: [groups.id],
  }),
}))
