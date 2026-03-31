import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from "@/hooks/use-budget-data";
import { formatEuro, formatFullDate, daysUntil } from "@/lib/utils";
import { Target, Plus, Trash2, TrendingUp, Home, Plane, Shield, Pencil } from "lucide-react";

const GOAL_ICONS: Record<string, any> = {
  "plane": Plane, "home": Home, "shield": Shield, "piggy-bank": TrendingUp, "target": Target
};

const emptyGoalForm = { name: "", targetAmount: "", currentAmount: "0", targetDate: "", icon: "target", color: "#3B82F6" };

export default function ObjectifsPage() {
  const { data: goals } = useGoals();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addAmountId, setAddAmountId] = useState<number | null>(null);
  const [addAmount, setAddAmount] = useState("");

  const [addForm, setAddForm] = useState({ ...emptyGoalForm });
  const [editForm, setEditForm] = useState({ ...emptyGoalForm });

  const handleCreate = () => {
    if (!addForm.name || !addForm.targetAmount) return;
    createGoal.mutate({
      name: addForm.name,
      targetAmount: parseFloat(addForm.targetAmount),
      currentAmount: parseFloat(addForm.currentAmount) || 0,
      targetDate: addForm.targetDate || null,
      icon: addForm.icon,
      color: addForm.color,
    });
    setAddForm({ ...emptyGoalForm });
    setAddDialogOpen(false);
  };

  const openEdit = (goal: any) => {
    setEditingId(goal.id);
    setEditForm({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      currentAmount: String(goal.currentAmount),
      targetDate: goal.targetDate || "",
      icon: goal.icon,
      color: goal.color,
    });
    setEditDialogOpen(true);
  };

  const handleEdit = () => {
    if (!editingId || !editForm.name || !editForm.targetAmount) return;
    updateGoal.mutate({
      id: editingId,
      name: editForm.name,
      targetAmount: parseFloat(editForm.targetAmount),
      currentAmount: parseFloat(editForm.currentAmount) || 0,
      targetDate: editForm.targetDate || null,
      icon: editForm.icon,
      color: editForm.color,
    });
    setEditDialogOpen(false);
    setEditingId(null);
  };

  const handleAddAmount = (goalId: number, current: number) => {
    const amt = parseFloat(addAmount);
    if (isNaN(amt) || amt <= 0) return;
    updateGoal.mutate({ id: goalId, currentAmount: current + amt });
    setAddAmountId(null);
    setAddAmount("");
  };

  function GoalForm({ form, setForm, onSubmit, isPending, submitLabel }: {
    form: typeof emptyGoalForm; setForm: (f: typeof emptyGoalForm) => void;
    onSubmit: () => void; isPending: boolean; submitLabel: string;
  }) {
    return (
      <div className="space-y-3 pt-2">
        <div className="space-y-1"><Label className="text-xs">Nom</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Vacances été" data-testid="input-goal-name" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label className="text-xs">Montant cible (€)</Label><Input type="number" min={0} value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} placeholder="3000" data-testid="input-goal-target" /></div>
          <div className="space-y-1"><Label className="text-xs">Déjà épargné (€)</Label><Input type="number" min={0} value={form.currentAmount} onChange={e => setForm({ ...form, currentAmount: e.target.value })} placeholder="0" data-testid="input-goal-current" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label className="text-xs">Date cible</Label><Input type="date" value={form.targetDate} onChange={e => setForm({ ...form, targetDate: e.target.value })} /></div>
          <div className="space-y-1"><Label className="text-xs">Couleur</Label><Input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="h-9 p-1" /></div>
        </div>
        <Button className="w-full" onClick={onSubmit} disabled={isPending} data-testid="btn-submit-goal">
          {isPending ? "En cours..." : submitLabel}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> Objectifs d'épargne</h1>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="btn-add-goal"><Plus className="w-4 h-4 mr-1" /> Nouvel objectif</Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Nouvel objectif</DialogTitle></DialogHeader>
            <GoalForm form={addForm} setForm={setAddForm} onSubmit={handleCreate} isPending={createGoal.isPending} submitLabel="Créer l'objectif" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Modifier l'objectif</DialogTitle></DialogHeader>
          <GoalForm form={editForm} setForm={setEditForm} onSubmit={handleEdit} isPending={updateGoal.isPending} submitLabel="Enregistrer" />
          <DialogFooter className="mt-2">
            <Button variant="destructive" size="sm" onClick={() => { if (editingId) { deleteGoal.mutate(editingId); setEditDialogOpen(false); setEditingId(null); } }} data-testid="btn-delete-goal">
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals?.map(goal => {
          const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          const remaining = goal.targetAmount - goal.currentAmount;
          const days = goal.targetDate ? daysUntil(goal.targetDate) : null;
          const monthlyNeeded = days && days > 0 && remaining > 0 ? remaining / (days / 30) : null;
          const IconComp = GOAL_ICONS[goal.icon] || Target;

          return (
            <Card key={goal.id} className="group relative overflow-hidden cursor-pointer hover:border-primary/30 transition-colors" onClick={() => openEdit(goal)} data-testid={`goal-card-${goal.id}`}>
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: goal.color }} />
              <CardContent className="pt-5 pb-4 px-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${goal.color}20` }}>
                      <IconComp className="w-4 h-4" style={{ color: goal.color }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{goal.name}</h3>
                      {goal.targetDate && (
                        <p className="text-[11px] text-muted-foreground">
                          {days !== null && days > 0 ? `${days} jours restants` : days === 0 ? "Aujourd'hui" : "Date passée"}
                        </p>
                      )}
                    </div>
                  </div>
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="tabular-nums font-medium">{formatEuro(goal.currentAmount)}</span>
                    <span className="text-muted-foreground tabular-nums">{formatEuro(goal.targetAmount)}</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, pct)}%`, backgroundColor: goal.color }} />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[11px] text-muted-foreground tabular-nums">{pct.toFixed(1)}%</span>
                    {monthlyNeeded && <span className="text-[11px] text-muted-foreground tabular-nums">{formatEuro(monthlyNeeded)}/mois nécessaire</span>}
                  </div>
                </div>

                {addAmountId === goal.id ? (
                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <Input type="number" min={0} step={50} value={addAmount} onChange={e => setAddAmount(e.target.value)} placeholder="Montant" className="h-8 text-xs" autoFocus />
                    <Button size="sm" className="h-8 text-xs" onClick={() => handleAddAmount(goal.id, goal.currentAmount)}>OK</Button>
                    <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setAddAmountId(null)}>×</Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="w-full h-7 text-xs" onClick={e => { e.stopPropagation(); setAddAmountId(goal.id); setAddAmount(""); }}>
                    <Plus className="w-3 h-3 mr-1" /> Ajouter de l'épargne
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
        {goals?.length === 0 && (
          <p className="col-span-full text-center text-sm text-muted-foreground py-12">Aucun objectif défini</p>
        )}
      </div>
    </div>
  );
}
