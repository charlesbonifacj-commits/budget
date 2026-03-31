import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ── Profiles ──
  app.get("/api/profiles", async (_req, res) => {
    res.json(await storage.getProfiles());
  });
  app.post("/api/profiles", async (req, res) => {
    res.status(201).json(await storage.createProfile(req.body));
  });
  app.patch("/api/profiles/:id", async (req, res) => {
    const r = await storage.updateProfile(Number(req.params.id), req.body);
    r ? res.json(r) : res.status(404).json({ message: "Profil non trouvé" });
  });
  app.delete("/api/profiles/:id", async (req, res) => {
    await storage.deleteProfile(Number(req.params.id));
    res.status(204).send();
  });

  // ── Categories ──
  app.get("/api/categories", async (_req, res) => {
    res.json(await storage.getCategories());
  });
  app.post("/api/categories", async (req, res) => {
    res.status(201).json(await storage.createCategory(req.body));
  });
  app.patch("/api/categories/:id", async (req, res) => {
    const r = await storage.updateCategory(Number(req.params.id), req.body);
    r ? res.json(r) : res.status(404).json({ message: "Catégorie non trouvée" });
  });
  app.delete("/api/categories/:id", async (req, res) => {
    await storage.deleteCategory(Number(req.params.id));
    res.status(204).send();
  });

  // ── Expenses ──
  app.get("/api/expenses", async (req, res) => {
    const month = req.query.month as string | undefined;
    if (month) {
      res.json(await storage.getExpensesByMonth(month));
    } else {
      res.json(await storage.getExpenses());
    }
  });
  app.post("/api/expenses", async (req, res) => {
    res.status(201).json(await storage.createExpense(req.body));
  });
  app.patch("/api/expenses/:id", async (req, res) => {
    const r = await storage.updateExpense(Number(req.params.id), req.body);
    r ? res.json(r) : res.status(404).json({ message: "Dépense non trouvée" });
  });
  app.delete("/api/expenses/:id", async (req, res) => {
    await storage.deleteExpense(Number(req.params.id));
    res.status(204).send();
  });

  // ── Goals ──
  app.get("/api/goals", async (_req, res) => {
    res.json(await storage.getGoals());
  });
  app.post("/api/goals", async (req, res) => {
    res.status(201).json(await storage.createGoal(req.body));
  });
  app.patch("/api/goals/:id", async (req, res) => {
    const r = await storage.updateGoal(Number(req.params.id), req.body);
    r ? res.json(r) : res.status(404).json({ message: "Objectif non trouvé" });
  });
  app.delete("/api/goals/:id", async (req, res) => {
    await storage.deleteGoal(Number(req.params.id));
    res.status(204).send();
  });

  // ── Due Dates ──
  app.get("/api/due-dates", async (_req, res) => {
    res.json(await storage.getDueDates());
  });
  app.post("/api/due-dates", async (req, res) => {
    res.status(201).json(await storage.createDueDate(req.body));
  });
  app.patch("/api/due-dates/:id", async (req, res) => {
    const r = await storage.updateDueDate(Number(req.params.id), req.body);
    r ? res.json(r) : res.status(404).json({ message: "Échéance non trouvée" });
  });
  app.delete("/api/due-dates/:id", async (req, res) => {
    await storage.deleteDueDate(Number(req.params.id));
    res.status(204).send();
  });

  // ── Seed demo data ──
  app.post("/api/seed", async (_req, res) => {
    // Check if data already exists
    const existingProfiles = await storage.getProfiles();
    if (existingProfiles.length > 0) {
      return res.json({ message: "Données déjà présentes" });
    }

    // Profiles
    const p1 = await storage.createProfile({ name: "Marie", color: "#6366F1", salary: 2800, otherIncome: 0 });
    const p2 = await storage.createProfile({ name: "Lucas", color: "#F59E0B", salary: 2200, otherIncome: 150 });

    // Categories
    const cats = [
      { name: "Loyer", color: "#EF4444", icon: "home", plannedBudget: 1200 },
      { name: "Électricité", color: "#F59E0B", icon: "zap", plannedBudget: 120 },
      { name: "Internet", color: "#3B82F6", icon: "wifi", plannedBudget: 40 },
      { name: "Abonnements", color: "#8B5CF6", icon: "tv", plannedBudget: 80 },
      { name: "Courses", color: "#10B981", icon: "shopping-cart", plannedBudget: 550 },
      { name: "Assurances", color: "#F97316", icon: "shield", plannedBudget: 180 },
      { name: "Crédits", color: "#EC4899", icon: "credit-card", plannedBudget: 350 },
      { name: "Loisirs", color: "#06B6D4", icon: "music", plannedBudget: 250 },
      { name: "Transport", color: "#84CC16", icon: "car", plannedBudget: 150 },
      { name: "Santé", color: "#14B8A6", icon: "heart-pulse", plannedBudget: 80 },
      { name: "Téléphone", color: "#A855F7", icon: "smartphone", plannedBudget: 60 },
      { name: "Épargne", color: "#0EA5E9", icon: "piggy-bank", plannedBudget: 400 },
      { name: "Imprévus", color: "#78716C", icon: "alert-triangle", plannedBudget: 100 },
    ];
    const createdCats: any[] = [];
    for (const c of cats) {
      createdCats.push(await storage.createCategory(c));
    }

    // Expenses for March 2026
    const month = "2026-03";
    const demoExpenses = [
      { title: "Loyer appartement", amount: 1200, categoryId: createdCats[0].id, payerId: p1.id, date: "2026-03-01", month, frequency: "monthly", expenseType: "shared", splitMethod: "proportional", note: "Prélèvement automatique" },
      { title: "EDF", amount: 115, categoryId: createdCats[1].id, payerId: p2.id, date: "2026-03-05", month, frequency: "monthly", expenseType: "shared", splitMethod: "50-50", note: null },
      { title: "Fibre Free", amount: 40, categoryId: createdCats[2].id, payerId: p1.id, date: "2026-03-08", month, frequency: "monthly", expenseType: "shared", splitMethod: "50-50", note: null },
      { title: "Netflix", amount: 18, categoryId: createdCats[3].id, payerId: p1.id, date: "2026-03-01", month, frequency: "monthly", expenseType: "shared", splitMethod: "50-50", note: null },
      { title: "Spotify Duo", amount: 15, categoryId: createdCats[3].id, payerId: p2.id, date: "2026-03-01", month, frequency: "monthly", expenseType: "shared", splitMethod: "50-50", note: null },
      { title: "Disney+", amount: 12, categoryId: createdCats[3].id, payerId: p1.id, date: "2026-03-01", month, frequency: "monthly", expenseType: "shared", splitMethod: "50-50", note: null },
      { title: "Salle de sport", amount: 35, categoryId: createdCats[3].id, payerId: p2.id, date: "2026-03-01", month, frequency: "monthly", expenseType: "personal", splitMethod: "50-50", note: null },
      { title: "Courses semaine 1", amount: 125, categoryId: createdCats[4].id, payerId: p1.id, date: "2026-03-03", month, frequency: "one-time", expenseType: "shared", splitMethod: "50-50", note: "Leclerc" },
      { title: "Courses semaine 2", amount: 98, categoryId: createdCats[4].id, payerId: p2.id, date: "2026-03-10", month, frequency: "one-time", expenseType: "shared", splitMethod: "50-50", note: "Picard + marché" },
      { title: "Courses semaine 3", amount: 142, categoryId: createdCats[4].id, payerId: p1.id, date: "2026-03-17", month, frequency: "one-time", expenseType: "shared", splitMethod: "50-50", note: null },
      { title: "Courses semaine 4", amount: 110, categoryId: createdCats[4].id, payerId: p2.id, date: "2026-03-24", month, frequency: "one-time", expenseType: "shared", splitMethod: "50-50", note: null },
      { title: "Assurance habitation", amount: 45, categoryId: createdCats[5].id, payerId: p1.id, date: "2026-03-10", month, frequency: "monthly", expenseType: "shared", splitMethod: "50-50", note: "MAIF" },
      { title: "Mutuelle Marie", amount: 65, categoryId: createdCats[5].id, payerId: p1.id, date: "2026-03-05", month, frequency: "monthly", expenseType: "personal", splitMethod: "50-50", note: null },
      { title: "Mutuelle Lucas", amount: 58, categoryId: createdCats[5].id, payerId: p2.id, date: "2026-03-05", month, frequency: "monthly", expenseType: "personal", splitMethod: "50-50", note: null },
      { title: "Crédit auto", amount: 280, categoryId: createdCats[6].id, payerId: p2.id, date: "2026-03-15", month, frequency: "monthly", expenseType: "shared", splitMethod: "proportional", note: "Reste 18 mois" },
      { title: "Crédit conso", amount: 75, categoryId: createdCats[6].id, payerId: p1.id, date: "2026-03-20", month, frequency: "monthly", expenseType: "shared", splitMethod: "50-50", note: null },
      { title: "Restaurant anniversaire", amount: 95, categoryId: createdCats[7].id, payerId: p1.id, date: "2026-03-14", month, frequency: "one-time", expenseType: "shared", splitMethod: "50-50", note: "Bistrot du coin" },
      { title: "Cinéma", amount: 24, categoryId: createdCats[7].id, payerId: p2.id, date: "2026-03-22", month, frequency: "one-time", expenseType: "shared", splitMethod: "50-50", note: null },
      { title: "Jeu vidéo", amount: 60, categoryId: createdCats[7].id, payerId: p2.id, date: "2026-03-18", month, frequency: "one-time", expenseType: "personal", splitMethod: "50-50", note: null },
      { title: "Navigo Marie", amount: 86, categoryId: createdCats[8].id, payerId: p1.id, date: "2026-03-01", month, frequency: "monthly", expenseType: "personal", splitMethod: "50-50", note: null },
      { title: "Essence", amount: 65, categoryId: createdCats[8].id, payerId: p2.id, date: "2026-03-12", month, frequency: "one-time", expenseType: "shared", splitMethod: "50-50", note: null },
      { title: "Pharmacie", amount: 32, categoryId: createdCats[9].id, payerId: p1.id, date: "2026-03-07", month, frequency: "one-time", expenseType: "personal", splitMethod: "50-50", note: null },
      { title: "Dentiste Lucas", amount: 55, categoryId: createdCats[9].id, payerId: p2.id, date: "2026-03-20", month, frequency: "one-time", expenseType: "personal", splitMethod: "50-50", note: "Remboursé à 80%" },
      { title: "Forfait Marie", amount: 20, categoryId: createdCats[10].id, payerId: p1.id, date: "2026-03-08", month, frequency: "monthly", expenseType: "personal", splitMethod: "50-50", note: "Free Mobile" },
      { title: "Forfait Lucas", amount: 25, categoryId: createdCats[10].id, payerId: p2.id, date: "2026-03-08", month, frequency: "monthly", expenseType: "personal", splitMethod: "50-50", note: "SFR" },
      { title: "Livret A", amount: 300, categoryId: createdCats[11].id, payerId: p1.id, date: "2026-03-01", month, frequency: "monthly", expenseType: "shared", splitMethod: "proportional", note: "Virement auto" },
      { title: "Épargne Lucas", amount: 100, categoryId: createdCats[11].id, payerId: p2.id, date: "2026-03-01", month, frequency: "monthly", expenseType: "personal", splitMethod: "50-50", note: null },
      { title: "Réparation machine à laver", amount: 85, categoryId: createdCats[12].id, payerId: p1.id, date: "2026-03-25", month, frequency: "one-time", expenseType: "shared", splitMethod: "50-50", note: null },
    ];
    for (const e of demoExpenses) {
      await storage.createExpense(e as any);
    }

    // Goals
    await storage.createGoal({ name: "Vacances été", targetAmount: 3000, currentAmount: 1250, targetDate: "2026-07-01", icon: "plane", color: "#06B6D4" });
    await storage.createGoal({ name: "Fonds d'urgence", targetAmount: 10000, currentAmount: 6800, targetDate: null, icon: "shield", color: "#10B981" });
    await storage.createGoal({ name: "Apport immobilier", targetAmount: 40000, currentAmount: 12500, targetDate: "2027-12-01", icon: "home", color: "#8B5CF6" });

    // Due dates
    await storage.createDueDate({ label: "Loyer avril", amount: 1200, dueDate: "2026-04-01", categoryId: createdCats[0].id, recurrence: "monthly", isPaid: 0 });
    await storage.createDueDate({ label: "EDF avril", amount: 115, dueDate: "2026-04-05", categoryId: createdCats[1].id, recurrence: "monthly", isPaid: 0 });
    await storage.createDueDate({ label: "Assurance auto", amount: 520, dueDate: "2026-04-15", categoryId: createdCats[5].id, recurrence: "yearly", isPaid: 0 });
    await storage.createDueDate({ label: "Crédit auto avril", amount: 280, dueDate: "2026-04-15", categoryId: createdCats[6].id, recurrence: "monthly", isPaid: 0 });
    await storage.createDueDate({ label: "Taxe foncière", amount: 890, dueDate: "2026-10-15", categoryId: createdCats[12].id, recurrence: "yearly", isPaid: 0 });
    await storage.createDueDate({ label: "Fibre Free avril", amount: 40, dueDate: "2026-04-08", categoryId: createdCats[2].id, recurrence: "monthly", isPaid: 0 });

    res.json({ message: "Données de démo créées", profiles: [p1, p2] });
  });

  return httpServer;
}
