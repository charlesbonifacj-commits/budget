import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useProfiles, useCategories, useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from "@/hooks/use-budget-data";
import MonthNav from "@/components/month-nav";
import { formatEuro, formatDate, getCurrentMonth } from "@/lib/utils";
import { FREQUENCY_LABELS, EXPENSE_TYPE_LABELS, SPLIT_METHOD_LABELS } from "@shared/schema";
import type { Expense } from "@shared/schema";
import { Plus, Trash2, Filter, Pencil } from "lucide-react";

const emptyForm = {
  title: "", amount: "", categoryId: "", payerId: "", date: new Date().toISOString().split("T")[0],
  frequency: "one-time", expenseType: "shared", splitMethod: "50-50", splitPercent: "50", note: "",
};

function ExpenseForm({
  form, setForm, categories, profiles, onSubmit, isPending, submitLabel,
}: {
  form: typeof emptyForm; setForm: (f: typeof emptyForm) => void;
  categories: any[] | undefined; profiles: any[] | undefined;
  onSubmit: () => void; isPending: boolean; submitLabel: string;
}) {
  return (
    <div className="space-y-3 pt-2">
      <div className="space-y-1"><Label className="text-xs">Titre</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Courses Leclerc" data-testid="input-title" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label className="text-xs">Montant (€)</Label><Input type="number" min={0} step={0.01} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" data-testid="input-amount" /></div>
        <div className="space-y-1"><Label className="text-xs">Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} data-testid="input-date" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Catégorie</Label>
          <Select value={form.categoryId} onValueChange={v => setForm({ ...form, categoryId: v })}>
            <SelectTrigger data-testid="select-category"><SelectValue placeholder="Choisir" /></SelectTrigger>
            <SelectContent>{categories?.map(c => <SelectItem key={c.id} value={String(c.id)}><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />{c.name}</span></SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Payé par</Label>
          <Select value={form.payerId} onValueChange={v => setForm({ ...form, payerId: v })}>
            <SelectTrigger data-testid="select-payer"><SelectValue placeholder="Choisir" /></SelectTrigger>
            <SelectContent>{profiles?.map(p => <SelectItem key={p.id} value={String(p.id)}><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />{p.name}</span></SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Fréquence</Label>
          <Select value={form.frequency} onValueChange={v => setForm({ ...form, frequency: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(FREQUENCY_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Type</Label>
          <Select value={form.expenseType} onValueChange={v => setForm({ ...form, expenseType: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(EXPENSE_TYPE_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      {form.expenseType === "shared" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Répartition</Label>
            <Select value={form.splitMethod} onValueChange={v => setForm({ ...form, splitMethod: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(SPLIT_METHOD_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {form.splitMethod === "custom" && (
            <div className="space-y-1"><Label className="text-xs">% payeur</Label><Input type="number" min={0} max={100} value={form.splitPercent} onChange={e => setForm({ ...form, splitPercent: e.target.value })} /></div>
          )}
        </div>
      )}
      <div className="space-y-1"><Label className="text-xs">Note (optionnel)</Label><Textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} rows={2} placeholder="Détails..." /></div>
      <Button className="w-full" onClick={onSubmit} disabled={isPending} data-testid="btn-submit-expense">
        {isPending ? "En cours..." : submitLabel}
      </Button>
    </div>
  );
}

export default function DepensesPage() {
  const [month, setMonth] = useState(getCurrentMonth);
  const [filterPerson, setFilterPerson] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: profiles } = useProfiles();
  const { data: categories } = useCategories();
  const { data: allExpenses } = useExpenses();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const expenses = useMemo(() => {
    let filtered = allExpenses?.filter(e => e.month === month) || [];
    if (filterPerson !== "all") filtered = filtered.filter(e => e.payerId === Number(filterPerson));
    if (filterCategory !== "all") filtered = filtered.filter(e => e.categoryId === Number(filterCategory));
    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  }, [allExpenses, month, filterPerson, filterCategory]);

  const catMap = useMemo(() => {
    const m = new Map<number, any>();
    categories?.forEach(c => m.set(c.id, c));
    return m;
  }, [categories]);

  const profileMap = useMemo(() => {
    const m = new Map<number, any>();
    profiles?.forEach(p => m.set(p.id, p));
    return m;
  }, [profiles]);

  // Add form
  const [addForm, setAddForm] = useState({ ...emptyForm });
  // Edit form
  const [editForm, setEditForm] = useState({ ...emptyForm });

  const handleAdd = () => {
    if (!addForm.title || !addForm.amount || !addForm.categoryId || !addForm.payerId) return;
    const [y, m] = addForm.date.split("-");
    createExpense.mutate({
      title: addForm.title,
      amount: parseFloat(addForm.amount),
      categoryId: parseInt(addForm.categoryId),
      payerId: parseInt(addForm.payerId),
      date: addForm.date,
      month: `${y}-${m}`,
      frequency: addForm.frequency,
      expenseType: addForm.expenseType,
      splitMethod: addForm.splitMethod,
      splitPercent: parseFloat(addForm.splitPercent),
      note: addForm.note || null,
    });
    setAddForm({ ...emptyForm });
    setAddDialogOpen(false);
  };

  const openEdit = (e: Expense) => {
    setEditingId(e.id);
    setEditForm({
      title: e.title,
      amount: String(e.amount),
      categoryId: String(e.categoryId),
      payerId: String(e.payerId),
      date: e.date,
      frequency: e.frequency,
      expenseType: e.expenseType,
      splitMethod: e.splitMethod,
      splitPercent: String(e.splitPercent ?? 50),
      note: e.note || "",
    });
    setEditDialogOpen(true);
  };

  const handleEdit = () => {
    if (!editingId || !editForm.title || !editForm.amount || !editForm.categoryId || !editForm.payerId) return;
    const [y, m] = editForm.date.split("-");
    updateExpense.mutate({
      id: editingId,
      title: editForm.title,
      amount: parseFloat(editForm.amount),
      categoryId: parseInt(editForm.categoryId),
      payerId: parseInt(editForm.payerId),
      date: editForm.date,
      month: `${y}-${m}`,
      frequency: editForm.frequency,
      expenseType: editForm.expenseType,
      splitMethod: editForm.splitMethod,
      splitPercent: parseFloat(editForm.splitPercent),
      note: editForm.note || null,
    });
    setEditDialogOpen(false);
    setEditingId(null);
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Dépenses</h1>
        <div className="flex items-center gap-3">
          <MonthNav month={month} onChange={setMonth} />
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="btn-add-expense"><Plus className="w-4 h-4 mr-1" /> Ajouter</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Nouvelle dépense</DialogTitle></DialogHeader>
              <ExpenseForm form={addForm} setForm={setAddForm} categories={categories} profiles={profiles} onSubmit={handleAdd} isPending={createExpense.isPending} submitLabel="Ajouter la dépense" />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={filterPerson} onValueChange={setFilterPerson}>
          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les personnes</SelectItem>
            {profiles?.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {categories?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">{expenses.length} dépenses · Total : {formatEuro(total)}</span>
      </div>

      {/* Edit dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Modifier la dépense</DialogTitle></DialogHeader>
          <ExpenseForm form={editForm} setForm={setEditForm} categories={categories} profiles={profiles} onSubmit={handleEdit} isPending={updateExpense.isPending} submitLabel="Enregistrer les modifications" />
          <DialogFooter className="mt-2">
            <Button variant="destructive" size="sm" onClick={() => { if (editingId) { deleteExpense.mutate(editingId); setEditDialogOpen(false); setEditingId(null); } }} data-testid="btn-delete-in-edit">
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense list */}
      <div className="space-y-2">
        {expenses.map(e => {
          const cat = catMap.get(e.categoryId);
          const payer = profileMap.get(e.payerId);
          return (
            <Card key={e.id} className="group cursor-pointer hover:border-primary/30 transition-colors" onClick={() => openEdit(e)} data-testid={`expense-row-${e.id}`}>
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <span className="w-2.5 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: cat?.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{e.title}</span>
                    {e.expenseType === "personal" && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Perso</span>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{cat?.name}</span>
                    <span>·</span>
                    <span style={{ color: payer?.color }}>{payer?.name}</span>
                    <span>·</span>
                    <span>{formatDate(e.date)}</span>
                    {e.note && <><span>·</span><span className="truncate max-w-[120px]">{e.note}</span></>}
                  </div>
                </div>
                <span className="text-sm font-semibold tabular-nums whitespace-nowrap">{formatEuro(e.amount)}</span>
                <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </CardContent>
            </Card>
          );
        })}
        {expenses.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">Aucune dépense pour ce mois</p>
        )}
      </div>
    </div>
  );
}
