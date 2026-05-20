import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reportsTable = pgTable("civic_reports", {
  id: serial("id").primaryKey(),
  name: text("name"),
  phone: text("phone").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  imagePath: text("image_path"),
  location: text("location"),
  status: text("status").notNull().default("Pending"),
  department: text("department").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertReportSchema = createInsertSchema(reportsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;
