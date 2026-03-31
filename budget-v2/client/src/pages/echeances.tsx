import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useDueDates, useCategories, useCreateDueDate, useUpdateDueDate, useDeleteDueDate } from "@/hooks/use-budget-data";
import { formatEuro, formatFullDate, daysUntil } from "@/lib/utils";
import { CalendarClock, CheckCircle, Clock, AlertTriangle, Plus, Trash2, Pencil } from "lucide-react";
import type { DueDate } from "@shared/schema";

const emptyDueDateForm = { label: "", amount: "", dueDate: "", categoryId: "", recurrence: "monthly" };

export default function EcheancesPage() {
  const { data: dueDates } = useDueDates();
  const { data: categories } = useCategories();
  const createDueDate = useCreateDueDate();
  const updateDueDate = useUpdateDueDate();
  const deleteDueDate = useDeleteDueDate();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [addForm, setAddForm] = useState({ ...emptyDueDateForm });
  const [editForm, setEditForm] = useState({ ...emptyDueDateForm });

  const catMap = useMemo(() => {
    const m = new Map<number, any>();
    categories?.forEach(c => m.set(c.id, c));
    return m;
  }, [categories]);

  const sorted = useMemo(() => {
    return [...(dueDates || [])].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [dueDates]);

  const upcoming = sorted.filter(d => !d.isPaid);
  const paid = sorted.filter(d => d.isPaid);
  const totalUpcoming = upcoming.reduce((s, d) => s + d.amount, 0);

  const handleAdd = () => {
    if (!addForm.label || !addForm.amount || !addForm.dueDate) return;
    createDueDate.mutate({
      label: addForm.label,
      amount: parseFloat(addForm.amount),
      dueDate: addForm.dueDate,
      categoryId: addForm.categoryId ? parseInt(addForm.categoryId) : null,
      recurrence: addForm.recurrence,
      isPaid: 0,
    });
    setAddForm({ ...emptyDueDateForm });
    setAddDialogOpen(false);
  };

  const openEdit = (d: DueDate) => {
    setEditingId(d.id);
    setEditForm({
      label: d.label,
      amount: String(d.amount),
      dueDate: d.dueDate,
      categoryId: d.categoryId ? String(d.categoryId) : "",
      recurrence: d.recurrence,
    });
    setEditDialogOpen(true);
  };

  const handleEdit = () => {
    if (!editingId || !editForm.label || !editForm.amount || !editForm.dueDate) return;
    updateDueDate.mutate({
      id: editingId,
      label: editForm.label,
      amount: parseFloat(editForm.amount),
      dueDate: editForm.dueDate,
      categoryId: editForm.categoryId ? parseInt(editForm.categoryId) : null,
      recurrence: editForm.recurrence,
    });
    setEditDialogOpen(false);
    setEditingId(null);
  };

  function DueDateForm({ form, setForm, onSubmit, isPending, submitLabel }: {
    form: typeof emptyDueDateForm; setForm: (f: typeof emptyDueDateForm) => void;
    onSubmit: () => void; isPending: boolean; submitLabel: string;
  }) {
    return (
      <div className="space-y-3 pt-2">
        <div className="space-y-1"><Label className="text-xs">Libellé</Label><Input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="Ex: Loyer avril" data-testid="input-duedate-label" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label className="text-xs">Montant (€)</Label><Input type="number" min={0} step={0.01} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" data-testid="input-duedate-amount" /></div>
          <div className="space-y-1"><Label className="text-xs">Date d'échéance</Label><Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} data-testid="input-duedate-date" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Catégorie</Label>
            <Select value={form.categoryId} onValueChange={v => setForm({ ...form, categoryId: v })}>
              <SelectTrigger data-testid="select-duedate-category"><SelectValue placeholder="Aucune" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune</SelectItem>
                {categories?.map(c => <SelectItem key={c.id} value={String(c.id)}><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />{c.name}</span></SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Récurrence</Label>
            <Select value={form.recurrence} onValueChange={v => setForm({ ...form, recurrence: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="one-time">Ponctuel</SelectItem>
                <SelectItem value="monthly">Mensuel</SelectItem>
                <SelectItem value="yearly">Annuel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button className="w-full" onClick={onSubmit} disabled={isPending} data-testid="btn-submit-duedate">
          {isPending ? "En cours..." : submitLabel}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1000px] mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold flex items-center gap-2"><CalendarClock className="w-5 h-5 text-primary" /> Échéances</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground tabular-nums">Total à venir : {formatEuro(totalUpcoming)}</span>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="btn-add-duedate"><Plus className="w-4 h-4 mr-1" /> Ajouter</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Nouvelle échéance</DialogTitle></DialogHeader>
              <DueDateForm form={addForm} setForm={setAddForm} onSubmit={handleAdd} isPending={createDueDate.isPending} submitLabel="Créer l'échéance" />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Modifier l'échéance</DialogTitle></DialogHeader>
          <DueDateForm form={editForm} setForm={setEditForm} onSubmit={handleEdit} isPending={updateDueDate.isPending} submitLabel="Enregistrer" />
          <DialogFooter className="mt-2">
            <Button variant="destructive" size="sm" onClick={() => { if (editingId) { deleteDueDate.mutate(editingId); setEditDialogOpen(false); setEditingId(null); } }} data-testid="btn-delete-duedate">
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upcoming */}
      <div className="space-y-2">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">À venir</h2>
        {upcoming.map(d => {
          const cat = d.categoryId ? catMap.get(d.categoryId) : null;
          const days = daysUntil(d.dueDate);
          const isUrgent = days <= 7 && days >= 0;
          const isOverdue = days < 0;
          return (
            <Card key={d.id} className={`group cursor-pointer hover:border-primary/30 transition-colors ${isOverdue ? "border-destructive/30" : isUrgent ? "border-orange-500/30" : ""}`} onClick={() => openEdit(d)} data-testid={`duedate-row-${d.id}`}>
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isOverdue ? "bg-destructive/10" : isUrgent ? "bg-orange-500/10" : "bg-muted"}`}>
                  {isOverdue ? <AlertTriangle className="w-4 h-4 text-destructive" /> : isUrgent ? <Clock className="w-4 h-4 text-orange-500" /> : <CalendarClock className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{d.label}</span>
                    {cat && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>{cat.name}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatFullDate(d.dueDate)}
                    {isOverdue && <span className="text-destructive ml-1 font-medium">· En retard de {Math.abs(days)} jours</span>}
                    {isUrgent && !isOverdue && <span className="text-orange-500 ml-1 font-medium">· Dans {days} jour{days > 1 ? "s" : ""}</span>}
                    {!isUrgent && !isOverdue && days > 0 && <span className="ml-1">· Dans {days} jours</span>}
                    <span className="ml-1">· {d.recurrence === "monthly" ? "Mensuel" : d.recurrence === "yearly" ? "Annuel" : "Ponctuel"}</span>
                  </div>
                </div>
                <span className="text-sm font-semibold tabular-nums whitespace-nowrap">{formatEuro(d.amount)}</span>
                <Button variant="outline" size="sm" className="h-7 text-xs flex-shrink-0" onClick={e => { e.stopPropagation(); updateDueDate.mutate({ id: d.id, isPaid: 1 }); }}>
                  <CheckCircle className="w-3 h-3 mr-1" /> Payé
                </Button>
                <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </CardContent>
            </Card>
          );
        })}
        {upcoming.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">Aucune échéance à venir</p>
        )}
      </div>

      {/* Paid */}
      {paid.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Payées</h2>
          {paid.map(d => {
            const cat = d.categoryId ? catMap.get(d.categoryId) : null;
            return (
              <Card key={d.id} className="opacity-60 group cursor-pointer hover:opacity-80 transition-opacity" onClick={() => openEdit(d)} data-testid={`duedate-paid-${d.id}`}>
                <CardContent className="py-3 px-4 flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm line-through">{d.label}</span>
                    {cat && <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>{cat.name}</span>}
                  </div>
                  <span className="text-sm tabular-nums text-muted-foreground">{formatEuro(d.amount)}</span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={e => { e.stopPropagation(); updateDueDate.mutate({ id: d.id, isPaid: 0 }); }}>
                    Annuler
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
