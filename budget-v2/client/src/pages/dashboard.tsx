import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  useProfiles, useCategories, useExpenses, useSeedData,
  useCreateProfile, useUpdateProfile, useDeleteProfile,
  useCreateCategory, useUpdateCategory, useDeleteCategory,
} from "@/hooks/use-budget-data";
import MonthNav from "@/components/month-nav";
import { formatEuro, getCurrentMonth } from "@/lib/utils";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from "recharts";
import {
  TrendingUp, TrendingDown, PiggyBank, Wallet, AlertTriangle, Loader2, Pencil, Users, Check, X, Plus, Trash2, Settings2,
} from "lucide-react";
import type { Profile, Category, Expense } from "@shared/schema";

const PROFILE_COLORS = ["#6366F1", "#F59E0B", "#EF4444", "#10B981", "#EC4899", "#8B5CF6", "#06B6D4", "#F97316"];

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-popover border border-border px-3 py-2 shadow-md text-sm">
      <p className="font-medium" style={{ color: payload[0]?.payload?.color || payload[0]?.color }}>
        {payload[0]?.payload?.name || payload[0]?.name}
      </p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="tabular-nums" style={{ color: p.color }}>
          {p.name !== payload[0]?.payload?.name ? `${p.name}: ` : ""}{formatEuro(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [month, setMonth] = useState(getCurrentMonth);
  const { data: profiles, isLoading: loadingProfiles } = useProfiles();
  const { data: categories } = useCategories();
  const { data: allExpenses } = useExpenses();
  const seedMutation = useSeedData();
  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();
  const deleteProfile = useDeleteProfile();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  // Profile dialog state
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileDrafts, setProfileDrafts] = useState<Record<number, { name: string; salary: string; otherIncome: string }>>({});
  const [newProfileName, setNewProfileName] = useState("");

  // Category dialog state
  const [editCatOpen, setEditCatOpen] = useState(false);
  const [catDrafts, setCatDrafts] = useState<Record<number, { name: string; color: string; plannedBudget: string }>>({});
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#3B82F6");
  const [newCatBudget, setNewCatBudget] = useState("");

  // Budget edit state
  const [editingBudgetId, setEditingBudgetId] = useState<number | null>(null);
  const [budgetDraft, setBudgetDraft] = useState("");

  // Auto-seed on first load if no data
  useEffect(() => {
    if (profiles && profiles.length === 0 && !seedMutation.isPending) {
      seedMutation.mutate();
    }
  }, [profiles]);

  // Initialize profile drafts when dialog opens
  useEffect(() => {
    if (editProfileOpen && profiles) {
      const drafts: Record<number, { name: string; salary: string; otherIncome: string }> = {};
      profiles.forEach(p => {
        drafts[p.id] = { name: p.name, salary: String(p.salary), otherIncome: String(p.otherIncome) };
      });
      setProfileDrafts(drafts);
      setNewProfileName("");
    }
  }, [editProfileOpen, profiles]);

  // Initialize category drafts when dialog opens
  useEffect(() => {
    if (editCatOpen && categories) {
      const drafts: Record<number, { name: string; color: string; plannedBudget: string }> = {};
      categories.forEach(c => {
        drafts[c.id] = { name: c.name, color: c.color, plannedBudget: String(c.plannedBudget) };
      });
      setCatDrafts(drafts);
      setNewCatName("");
      setNewCatColor("#3B82F6");
      setNewCatBudget("");
    }
  }, [editCatOpen, categories]);

  const handleSaveProfiles = () => {
    Object.entries(profileDrafts).forEach(([id, draft]) => {
      const profile = profiles?.find(p => p.id === Number(id));
      if (!profile) return;
      const newSalary = parseFloat(draft.salary) || 0;
      const newOtherIncome = parseFloat(draft.otherIncome) || 0;
      if (draft.name !== profile.name || newSalary !== profile.salary || newOtherIncome !== profile.otherIncome) {
        updateProfile.mutate({ id: Number(id), name: draft.name, salary: newSalary, otherIncome: newOtherIncome });
      }
    });
    setEditProfileOpen(false);
  };

  const handleAddProfile = () => {
    if (!newProfileName.trim()) return;
    const usedColors = profiles?.map(p => p.color) || [];
    const nextColor = PROFILE_COLORS.find(c => !usedColors.includes(c)) || PROFILE_COLORS[Math.floor(Math.random() * PROFILE_COLORS.length)];
    createProfile.mutate({ name: newProfileName.trim(), color: nextColor, salary: 0, otherIncome: 0 });
    setNewProfileName("");
  };

  const handleDeleteProfile = (id: number) => {
    deleteProfile.mutate(id);
    const newDrafts = { ...profileDrafts };
    delete newDrafts[id];
    setProfileDrafts(newDrafts);
  };

  const handleSaveCategories = () => {
    Object.entries(catDrafts).forEach(([id, draft]) => {
      const cat = categories?.find(c => c.id === Number(id));
      if (!cat) return;
      const newBudget = parseFloat(draft.plannedBudget) || 0;
      if (draft.name !== cat.name || draft.color !== cat.color || newBudget !== cat.plannedBudget) {
        updateCategory.mutate({ id: Number(id), name: draft.name, color: draft.color, plannedBudget: newBudget });
      }
    });
    setEditCatOpen(false);
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    createCategory.mutate({ name: newCatName.trim(), color: newCatColor, icon: "tag", plannedBudget: parseFloat(newCatBudget) || 0 });
    setNewCatName("");
    setNewCatColor("#3B82F6");
    setNewCatBudget("");
  };

  const handleDeleteCategory = (id: number) => {
    deleteCategory.mutate(id);
    const newDrafts = { ...catDrafts };
    delete newDrafts[id];
    setCatDrafts(newDrafts);
  };

  const handleSaveBudget = (catId: number) => {
    const val = parseFloat(budgetDraft);
    if (!isNaN(val) && val >= 0) {
      updateCategory.mutate({ id: catId, plannedBudget: val });
    }
    setEditingBudgetId(null);
    setBudgetDraft("");
  };

  const expenses = useMemo(() => {
    return allExpenses?.filter(e => e.month === month) || [];
  }, [allExpenses, month]);

  const catMap = useMemo(() => {
    const m = new Map<number, Category>();
    categories?.forEach(c => m.set(c.id, c));
    return m;
  }, [categories]);

  const profileMap = useMemo(() => {
    const m = new Map<number, Profile>();
    profiles?.forEach(p => m.set(p.id, p));
    return m;
  }, [profiles]);

  // Calculations
  const totalIncome = useMemo(() => {
    return (profiles || []).reduce((s, p) => s + p.salary + p.otherIncome, 0);
  }, [profiles]);

  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);

  const fixedExpenses = useMemo(() =>
    expenses.filter(e => e.frequency === "monthly" || e.frequency === "yearly").reduce((s, e) => s + e.amount, 0),
  [expenses]);

  const variableExpenses = useMemo(() =>
    expenses.filter(e => e.frequency === "one-time" || e.frequency === "weekly").reduce((s, e) => s + e.amount, 0),
  [expenses]);

  const resteAVivre = totalIncome - totalExpenses;
  const savingsExpenses = useMemo(() =>
    expenses.filter(e => {
      const cat = catMap.get(e.categoryId);
      return cat?.name === "Épargne";
    }).reduce((s, e) => s + e.amount, 0),
  [expenses, catMap]);

  // Pie data — by category (only generate when categories are loaded)
  const pieData = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    const map = new Map<number, number>();
    expenses.forEach(e => { map.set(e.categoryId, (map.get(e.categoryId) || 0) + e.amount); });
    return Array.from(map.entries())
      .map(([catId, amount]) => {
        const cat = catMap.get(catId);
        return { name: cat?.name || "Autre", value: amount, color: cat?.color || "#888" };
      })
      .sort((a, b) => b.value - a.value);
  }, [expenses, catMap, categories]);

  // Bar data — by person
  const barData = useMemo(() => {
    return (profiles || []).map(p => {
      const total = expenses.filter(e => e.payerId === p.id).reduce((s, e) => s + e.amount, 0);
      return { name: p.name, montant: total, fill: p.color };
    });
  }, [profiles, expenses]);

  // Budget alerts
  const budgetAlerts = useMemo(() => {
    const alerts: { name: string; spent: number; budget: number; color: string }[] = [];
    const spentByCategory = new Map<number, number>();
    expenses.forEach(e => { spentByCategory.set(e.categoryId, (spentByCategory.get(e.categoryId) || 0) + e.amount); });
    categories?.forEach(cat => {
      const spent = spentByCategory.get(cat.id) || 0;
      if (cat.plannedBudget > 0 && spent > cat.plannedBudget) {
        alerts.push({ name: cat.name, spent, budget: cat.plannedBudget, color: cat.color });
      }
    });
    return alerts;
  }, [expenses, categories]);

  // Line chart — monthly evolution (last 6 months)
  const lineData = useMemo(() => {
    if (!allExpenses || !profiles) return [];
    const totalInc = (profiles || []).reduce((s, p) => s + p.salary + p.otherIncome, 0);
    const months: string[] = [];
    const [y, m] = month.split("-").map(Number);
    for (let i = 5; i >= 0; i--) {
      const d = new Date(y, m - 1 - i);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    return months.map(mo => {
      const moExpenses = allExpenses.filter(e => e.month === mo);
      const total = moExpenses.reduce((s, e) => s + e.amount, 0);
      const label = new Date(Number(mo.split("-")[0]), Number(mo.split("-")[1]) - 1)
        .toLocaleDateString("fr-FR", { month: "short" });
      return { name: label, resteAVivre: totalInc - total, depenses: total };
    });
  }, [allExpenses, profiles, month]);

  if (loadingProfiles) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profiles?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Chargement des données de démonstration...</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Tableau de bord</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditProfileOpen(true)} data-testid="btn-edit-profiles">
            <Users className="w-3.5 h-3.5 mr-1.5" /> Profils
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditCatOpen(true)} data-testid="btn-edit-categories">
            <Settings2 className="w-3.5 h-3.5 mr-1.5" /> Catégories
          </Button>
          <MonthNav month={month} onChange={setMonth} />
        </div>
      </div>

      {/* Profile management dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Gérer les profils</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            {profiles.map(p => {
              const draft = profileDrafts[p.id];
              if (!draft) return null;
              return (
                <div key={p.id} className="space-y-2 p-3 rounded-lg bg-muted/50 relative group">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                    <Input
                      value={draft.name}
                      onChange={e => setProfileDrafts({ ...profileDrafts, [p.id]: { ...draft, name: e.target.value } })}
                      className="h-8 text-sm font-medium"
                      data-testid={`input-profile-name-${p.id}`}
                    />
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteProfile(p.id)}
                      data-testid={`btn-delete-profile-${p.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Salaire (€)</Label>
                      <Input
                        type="number" min={0} step={100}
                        value={draft.salary}
                        onChange={e => setProfileDrafts({ ...profileDrafts, [p.id]: { ...draft, salary: e.target.value } })}
                        className="h-8 text-sm tabular-nums"
                        data-testid={`input-profile-salary-${p.id}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Autres revenus (€)</Label>
                      <Input
                        type="number" min={0} step={50}
                        value={draft.otherIncome}
                        onChange={e => setProfileDrafts({ ...profileDrafts, [p.id]: { ...draft, otherIncome: e.target.value } })}
                        className="h-8 text-sm tabular-nums"
                        data-testid={`input-profile-other-${p.id}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add new profile */}
            <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-border">
              <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <Input
                value={newProfileName}
                onChange={e => setNewProfileName(e.target.value)}
                placeholder="Nouveau profil..."
                className="h-8 text-sm"
                onKeyDown={e => { if (e.key === "Enter") handleAddProfile(); }}
                data-testid="input-new-profile-name"
              />
              <Button size="sm" className="h-8 flex-shrink-0" onClick={handleAddProfile} disabled={!newProfileName.trim()} data-testid="btn-add-profile">
                Ajouter
              </Button>
            </div>

            <Button className="w-full" onClick={handleSaveProfiles} disabled={updateProfile.isPending} data-testid="btn-save-profiles">
              {updateProfile.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category management dialog */}
      <Dialog open={editCatOpen} onOpenChange={setEditCatOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Gérer les catégories</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            {categories?.map(c => {
              const draft = catDrafts[c.id];
              if (!draft) return null;
              return (
                <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <input
                    type="color"
                    value={draft.color}
                    onChange={e => setCatDrafts({ ...catDrafts, [c.id]: { ...draft, color: e.target.value } })}
                    className="w-7 h-7 rounded border-0 cursor-pointer p-0 flex-shrink-0"
                    data-testid={`input-cat-color-${c.id}`}
                  />
                  <Input
                    value={draft.name}
                    onChange={e => setCatDrafts({ ...catDrafts, [c.id]: { ...draft, name: e.target.value } })}
                    className="h-8 text-sm font-medium flex-1"
                    data-testid={`input-cat-name-${c.id}`}
                  />
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Input
                      type="number" min={0} step={10}
                      value={draft.plannedBudget}
                      onChange={e => setCatDrafts({ ...catDrafts, [c.id]: { ...draft, plannedBudget: e.target.value } })}
                      className="h-8 w-24 text-xs tabular-nums"
                      placeholder="Budget"
                      data-testid={`input-cat-budget-${c.id}`}
                    />
                    <span className="text-xs text-muted-foreground">€</span>
                  </div>
                  <Button
                    variant="ghost" size="icon"
                    className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteCategory(c.id)}
                    data-testid={`btn-delete-cat-${c.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              );
            })}

            {/* Add new category */}
            <div className="flex items-center gap-2 p-2 rounded-lg border border-dashed border-border">
              <input
                type="color"
                value={newCatColor}
                onChange={e => setNewCatColor(e.target.value)}
                className="w-7 h-7 rounded border-0 cursor-pointer p-0 flex-shrink-0"
                data-testid="input-new-cat-color"
              />
              <Input
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="Nouvelle catégorie..."
                className="h-8 text-sm flex-1"
                data-testid="input-new-cat-name"
              />
              <Input
                type="number" min={0} step={10}
                value={newCatBudget}
                onChange={e => setNewCatBudget(e.target.value)}
                className="h-8 w-24 text-xs tabular-nums flex-shrink-0"
                placeholder="Budget €"
                data-testid="input-new-cat-budget"
              />
              <Button size="sm" className="h-8 flex-shrink-0" onClick={handleAddCategory} disabled={!newCatName.trim()} data-testid="btn-add-cat">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>

            <Button className="w-full" onClick={handleSaveCategories} disabled={updateCategory.isPending} data-testid="btn-save-categories">
              {updateCategory.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alerts */}
      {budgetAlerts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {budgetAlerts.map(a => (
            <div key={a.name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
              <AlertTriangle className="w-3 h-3" />
              {a.name} : {formatEuro(a.spent)} / {formatEuro(a.budget)}
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Revenus", value: totalIncome, icon: TrendingUp, iconColor: "text-emerald-500" },
          { label: "Charges fixes", value: fixedExpenses, icon: TrendingDown, iconColor: "text-orange-500" },
          { label: "Dépenses variables", value: variableExpenses, icon: Receipt, iconColor: "text-blue-500" },
          { label: "Reste à vivre", value: resteAVivre, icon: PiggyBank, iconColor: resteAVivre >= 0 ? "text-emerald-500" : "text-red-500" },
          { label: "Épargne", value: savingsExpenses, icon: Wallet, iconColor: "text-primary" },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{kpi.label}</span>
                <kpi.icon className={`w-3.5 h-3.5 ${kpi.iconColor}`} />
              </div>
              <p className={`text-lg font-bold tabular-nums ${kpi.label === "Reste à vivre" && resteAVivre < 0 ? "text-destructive" : ""}`}>
                {formatEuro(kpi.value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pie chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dépenses par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="w-full md:w-1/2 h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={95} paddingAngle={2} dataKey="value" animationDuration={600}>
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 space-y-1">
                  {pieData.slice(0, 8).map(item => (
                    <div key={item.name} className="flex items-center justify-between py-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs">{item.name}</span>
                      </div>
                      <span className="text-xs font-medium tabular-nums">{formatEuro(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-12">Aucune dépense ce mois</p>
            )}
          </CardContent>
        </Card>

        {/* Bar chart — per person */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dépenses par personne</CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${v}€`} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} axisLine={false} tickLine={false} width={60} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="montant" radius={[0, 4, 4, 0]} animationDuration={600} name="Dépenses">
                      {barData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-12">Aucune donnée</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Line chart — evolution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Évolution mensuelle</CardTitle>
        </CardHeader>
        <CardContent>
          {lineData.length > 0 ? (
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${v}€`} axisLine={false} tickLine={false} width={55} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="resteAVivre" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name="Reste à vivre" animationDuration={600} />
                  <Line type="monotone" dataKey="depenses" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} name="Dépenses" animationDuration={600} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-12">Pas assez de données</p>
          )}
        </CardContent>
      </Card>

      {/* Budget prévu vs réel — with inline edit */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Budget prévu vs réel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {categories?.filter(c => c.plannedBudget > 0).map(cat => {
              const spent = expenses.filter(e => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0);
              const pct = cat.plannedBudget > 0 ? Math.min(100, (spent / cat.plannedBudget) * 100) : 0;
              const over = spent > cat.plannedBudget;
              const isEditing = editingBudgetId === cat.id;
              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-xs font-medium">{cat.name}</span>
                    </div>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <span className={`text-xs tabular-nums ${over ? "text-destructive" : "text-muted-foreground"}`}>{formatEuro(spent)} /</span>
                        <Input
                          type="number" min={0} step={10}
                          value={budgetDraft}
                          onChange={e => setBudgetDraft(e.target.value)}
                          className="h-6 w-20 text-xs tabular-nums px-1.5"
                          autoFocus
                          onKeyDown={e => { if (e.key === "Enter") handleSaveBudget(cat.id); if (e.key === "Escape") { setEditingBudgetId(null); setBudgetDraft(""); } }}
                          data-testid={`input-budget-${cat.id}`}
                        />
                        <span className="text-xs text-muted-foreground">€</span>
                        <button onClick={() => handleSaveBudget(cat.id)} className="p-0.5 rounded hover:bg-muted text-emerald-500" data-testid={`save-budget-${cat.id}`}><Check className="w-3 h-3" /></button>
                        <button onClick={() => { setEditingBudgetId(null); setBudgetDraft(""); }} className="p-0.5 rounded hover:bg-muted text-muted-foreground"><X className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <button
                        className="flex items-center gap-1 group/budget"
                        onClick={() => { setEditingBudgetId(cat.id); setBudgetDraft(String(cat.plannedBudget)); }}
                        data-testid={`edit-budget-${cat.id}`}
                      >
                        <span className={`text-xs tabular-nums ${over ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                          {formatEuro(spent)} / {formatEuro(cat.plannedBudget)}
                        </span>
                        <Pencil className="w-2.5 h-2.5 text-muted-foreground opacity-0 group-hover/budget:opacity-100 transition-opacity" />
                      </button>
                    )}
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, pct)}%`,
                        backgroundColor: over ? "hsl(var(--destructive))" : cat.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Receipt({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>
    </svg>
  );
}
