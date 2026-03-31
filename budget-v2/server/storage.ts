import {
  type Profile, type InsertProfile, profiles,
  type Category, type InsertCategory, categories,
  type Expense, type InsertExpense, expenses,
  type Goal, type InsertGoal, goals,
  type DueDate, type InsertDueDate, dueDates,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");
export const db = drizzle(sqlite);

export interface IStorage {
  // Profiles
  getProfiles(): Promise<Profile[]>;
  getProfile(id: number): Promise<Profile | undefined>;
  createProfile(p: InsertProfile): Promise<Profile>;
  updateProfile(id: number, p: Partial<InsertProfile>): Promise<Profile | undefined>;
  deleteProfile(id: number): Promise<void>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(c: InsertCategory): Promise<Category>;
  updateCategory(id: number, c: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<void>;

  // Expenses
  getExpenses(): Promise<Expense[]>;
  getExpensesByMonth(month: string): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(e: InsertExpense): Promise<Expense>;
  updateExpense(id: number, e: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<void>;

  // Goals
  getGoals(): Promise<Goal[]>;
  createGoal(g: InsertGoal): Promise<Goal>;
  updateGoal(id: number, g: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<void>;

  // Due dates
  getDueDates(): Promise<DueDate[]>;
  createDueDate(d: InsertDueDate): Promise<DueDate>;
  updateDueDate(id: number, d: Partial<InsertDueDate>): Promise<DueDate | undefined>;
  deleteDueDate(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // ── Profiles ──
  async getProfiles() { return db.select().from(profiles).all(); }
  async getProfile(id: number) { return db.select().from(profiles).where(eq(profiles.id, id)).get(); }
  async createProfile(p: InsertProfile) { return db.insert(profiles).values(p).returning().get(); }
  async updateProfile(id: number, p: Partial<InsertProfile>) { return db.update(profiles).set(p).where(eq(profiles.id, id)).returning().get(); }
  async deleteProfile(id: number) { db.delete(profiles).where(eq(profiles.id, id)).run(); }

  // ── Categories ──
  async getCategories() { return db.select().from(categories).all(); }
  async getCategory(id: number) { return db.select().from(categories).where(eq(categories.id, id)).get(); }
  async createCategory(c: InsertCategory) { return db.insert(categories).values(c).returning().get(); }
  async updateCategory(id: number, c: Partial<InsertCategory>) { return db.update(categories).set(c).where(eq(categories.id, id)).returning().get(); }
  async deleteCategory(id: number) { db.delete(categories).where(eq(categories.id, id)).run(); }

  // ── Expenses ──
  async getExpenses() { return db.select().from(expenses).all(); }
  async getExpensesByMonth(month: string) { return db.select().from(expenses).where(eq(expenses.month, month)).all(); }
  async getExpense(id: number) { return db.select().from(expenses).where(eq(expenses.id, id)).get(); }
  async createExpense(e: InsertExpense) { return db.insert(expenses).values(e).returning().get(); }
  async updateExpense(id: number, e: Partial<InsertExpense>) { return db.update(expenses).set(e).where(eq(expenses.id, id)).returning().get(); }
  async deleteExpense(id: number) { db.delete(expenses).where(eq(expenses.id, id)).run(); }

  // ── Goals ──
  async getGoals() { return db.select().from(goals).all(); }
  async createGoal(g: InsertGoal) { return db.insert(goals).values(g).returning().get(); }
  async updateGoal(id: number, g: Partial<InsertGoal>) { return db.update(goals).set(g).where(eq(goals.id, id)).returning().get(); }
  async deleteGoal(id: number) { db.delete(goals).where(eq(goals.id, id)).run(); }

  // ── Due dates ──
  async getDueDates() { return db.select().from(dueDates).all(); }
  async createDueDate(d: InsertDueDate) { return db.insert(dueDates).values(d).returning().get(); }
  async updateDueDate(id: number, d: Partial<InsertDueDate>) { return db.update(dueDates).set(d).where(eq(dueDates.id, id)).returning().get(); }
  async deleteDueDate(id: number) { db.delete(dueDates).where(eq(dueDates.id, id)).run(); }
}

export const storage = new DatabaseStorage();
