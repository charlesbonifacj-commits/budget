import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ── Profiles ──
export const profiles = sqliteTable("profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  color: text("color").notNull(),
  salary: real("salary").notNull().default(0),
  otherIncome: real("other_income").notNull().default(0),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true });
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

// ── Categories ──
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  color: text("color").notNull(),
  icon: text("icon").notNull(),
  plannedBudget: real("planned_budget").notNull().default(0),
});

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// ── Expenses ──
export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  amount: real("amount").notNull(),
  categoryId: integer("category_id").notNull(),
  payerId: integer("payer_id").notNull(),
  date: text("date").notNull(), // "2026-03-15"
  month: text("month").notNull(), // "2026-03"
  frequency: text("frequency").notNull().default("monthly"), // one-time, weekly, monthly, yearly
  expenseType: text("expense_type").notNull().default("shared"), // shared, personal
  splitMethod: text("split_method").notNull().default("50-50"), // 50-50, custom, proportional
  splitPercent: real("split_percent").default(50), // custom percent for payer (only used when splitMethod is "custom")
  note: text("note"),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true });
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

// ── Goals ──
export const goals = sqliteTable("goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  targetAmount: real("target_amount").notNull(),
  currentAmount: real("current_amount").notNull().default(0),
  targetDate: text("target_date"),
  icon: text("icon").notNull().default("piggy-bank"),
  color: text("color").notNull().default("#3B82F6"),
});

export const insertGoalSchema = createInsertSchema(goals).omit({ id: true });
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

// ── Due Dates (échéances) ──
export const dueDates = sqliteTable("due_dates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  label: text("label").notNull(),
  amount: real("amount").notNull(),
  dueDate: text("due_date").notNull(), // "2026-04-05"
  categoryId: integer("category_id"),
  recurrence: text("recurrence").notNull().default("monthly"), // monthly, yearly, one-time
  isPaid: integer("is_paid").notNull().default(0), // 0 or 1
});

export const insertDueDateSchema = createInsertSchema(dueDates).omit({ id: true });
export type InsertDueDate = z.infer<typeof insertDueDateSchema>;
export type DueDate = typeof dueDates.$inferSelect;

// ── Constants ──
export const FREQUENCY_LABELS: Record<string, string> = {
  "one-time": "Ponctuelle",
  "weekly": "Hebdomadaire",
  "monthly": "Mensuelle",
  "yearly": "Annuelle",
};

export const EXPENSE_TYPE_LABELS: Record<string, string> = {
  "shared": "Commune",
  "personal": "Personnelle",
};

export const SPLIT_METHOD_LABELS: Record<string, string> = {
  "50-50": "50/50",
  "custom": "Personnalisé",
  "proportional": "Proportionnel aux revenus",
};
