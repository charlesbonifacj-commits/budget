import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useProfiles, useCategories, useExpenses } from "@/hooks/use-budget-data";
import { formatEuro, getCurrentMonth } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts";
import { SlidersHorizontal, TrendingUp, TrendingDown, ArrowRightLeft, RotateCcw, PiggyBank } from "lucide-react";

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-popover border border-border px-3 py-2 shadow-md text-sm">
      <p className="font-medium">{payload[0]?.payload?.name}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="tabular-nums" style={{ color: p.color }}>
          {p.name}: {formatEuro(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function SimulateurPage() {
  const { data: profiles } = useProfiles();
  const { data: categories } = useCategories();
  const { data: allExpenses } = useExpenses();
  const month = getCurrentMonth();

  const expenses = useMemo(() => allExpenses?.filter(e => e.month === month) || [], [allExpenses, month]);

  // Simulation parameters
  const [simSalary1, setSimSalary1] = useState<number | null>(null);
  const [simSalary2, setSimSalary2] = useState<number | null>(null);
  const [simExtra, setSimExtra] = useState<number>(0);
  const [catAdjustments, setCatAdjustments] = useState<Record<number, number>>({});

  const p1 = profiles?.[0];
  const p2 = profiles?.[1];

  const salary1 = simSalary1 ?? (p1?.salary || 0);
  const salary2 = simSalary2 ?? (p2?.salary || 0);
  const otherIncome1 = p1?.otherIncome || 0;
  const otherIncome2 = p2?.otherIncome || 0;

  const currentTotalIncome = (p1?.salary || 0) + (p2?.salary || 0) + otherIncome1 + otherIncome2;
  const simTotalIncome = salary1 + salary2 + otherIncome1 + otherIncome2 + simExtra;

  // Current expenses by category
  const currentByCategory = useMemo(() => {
    const map = new Map<number, number>();
    expenses.forEach(e => map.set(e.categoryId, (map.get(e.categoryId) || 0) + e.amount));
    return map;
  }, [expenses]);

  const currentTotalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  // Simulated expenses (category-level adjustments)
  const simExpensesByCategory = useMemo(() => {
    const map = new Map<number, number>();
    categories?.forEach(c => {
      const current = currentByCategory.get(c.id) || 0;
      const adj = catAdjustments[c.id] ?? 0;
      map.set(c.id, Math.max(0, current + adj));
    });
    return map;
  }, [categories, currentByCategory, catAdjustments]);

  const simTotalExpenses = useMemo(() => {
    let total = 0;
    simExpensesByCategory.forEach(v => total += v);
    return total;
  }, [simExpensesByCategory]);

  const currentResteAVivre = currentTotalIncome - currentTotalExpenses;
  const simResteAVivre = simTotalIncome - simTotalExpenses;

  const comparisonData = useMemo(() => {
    if (!categories) return [];
    return categories
      .filter(c => (currentByCategory.get(c.id) || 0) > 0 || (simExpensesByCategory.get(c.id) || 0) > 0)
      .map(c => ({
        name: c.name,
        color: c.color,
        actuel: currentByCategory.get(c.id) || 0,
        simulation: simExpensesByCategory.get(c.id) || 0,
      }));
  }, [categories, currentByCategory, simExpensesByCategory]);

  const handleReset = () => {
    setSimSalary1(null);
    setSimSalary2(null);
    setSimExtra(0);
    setCatAdjustments({});
  };

  const hasChanges = simSalary1 !== null || simSalary2 !== null || simExtra !== 0 || Object.keys(catAdjustments).length > 0;

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-primary" /> Simulateur
        </h1>
        {hasChanges && (
          <Button variant="outline" size="sm" onClick={handleReset} data-testid="btn-reset-sim">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Réinitialiser
          </Button>
        )}
      </div>

      {/* Income simulation */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Simuler les revenus
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {p1 && (
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p1.color }} />
                  Salaire {p1.name}
                </Label>
                <Input
                  type="number"
                  min={0}
                  step={100}
                  value={salary1}
                  onChange={e => setSimSalary1(parseFloat(e.target.value) || 0)}
                  className="tabular-nums"
                  data-testid="input-sim-salary1"
                />
                {simSalary1 !== null && simSalary1 !== p1.salary && (
                  <p className={`text-[11px] tabular-nums ${simSalary1 > p1.salary ? "text-emerald-500" : "text-orange-500"}`}>
                    {simSalary1 > p1.salary ? "+" : ""}{formatEuro(simSalary1 - p1.salary)}
                  </p>
                )}
              </div>
            )}
            {p2 && (
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p2.color }} />
                  Salaire {p2.name}
                </Label>
                <Input
                  type="number"
                  min={0}
                  step={100}
                  value={salary2}
                  onChange={e => setSimSalary2(parseFloat(e.target.value) || 0)}
                  className="tabular-nums"
                  data-testid="input-sim-salary2"
                />
                {simSalary2 !== null && simSalary2 !== p2.salary && (
                  <p className={`text-[11px] tabular-nums ${simSalary2 > p2.salary ? "text-emerald-500" : "text-orange-500"}`}>
                    {simSalary2 > p2.salary ? "+" : ""}{formatEuro(simSalary2 - p2.salary)}
                  </p>
                )}
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs">Revenus supplémentaires</Label>
              <Input
                type="number"
                min={0}
                step={50}
                value={simExtra}
                onChange={e => setSimExtra(parseFloat(e.target.value) || 0)}
                className="tabular-nums"
                data-testid="input-sim-extra"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category adjustments */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-orange-500" /> Ajuster les dépenses par catégorie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categories?.filter(c => (currentByCategory.get(c.id) || 0) > 0 || c.plannedBudget > 0).map(c => {
              const current = currentByCategory.get(c.id) || 0;
              const adj = catAdjustments[c.id] ?? 0;
              const simulated = Math.max(0, current + adj);
              const maxAdjust = Math.max(500, current * 2);
              return (
                <div key={c.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="text-xs font-medium">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs tabular-nums">
                      <span className="text-muted-foreground">{formatEuro(current)}</span>
                      {adj !== 0 && (
                        <>
                          <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
                          <span className={adj > 0 ? "text-orange-500 font-medium" : "text-emerald-500 font-medium"}>
                            {formatEuro(simulated)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Slider
                    value={[adj]}
                    min={-current}
                    max={maxAdjust}
                    step={10}
                    onValueChange={([v]) => {
                      if (v === 0) {
                        const next = { ...catAdjustments };
                        delete next[c.id];
                        setCatAdjustments(next);
                      } else {
                        setCatAdjustments({ ...catAdjustments, [c.id]: v });
                      }
                    }}
                    className="cursor-pointer"
                    data-testid={`slider-cat-${c.id}`}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className={simResteAVivre < 0 ? "border-destructive/30" : simResteAVivre > currentResteAVivre ? "border-emerald-500/30" : ""}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-1.5">
            <PiggyBank className="w-4 h-4 text-primary" /> Résultat de la simulation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Revenus</span>
              <p className="text-base font-bold tabular-nums">{formatEuro(simTotalIncome)}</p>
              {simTotalIncome !== currentTotalIncome && (
                <p className={`text-[11px] tabular-nums ${simTotalIncome > currentTotalIncome ? "text-emerald-500" : "text-orange-500"}`}>
                  {simTotalIncome > currentTotalIncome ? "+" : ""}{formatEuro(simTotalIncome - currentTotalIncome)}
                </p>
              )}
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Dépenses</span>
              <p className="text-base font-bold tabular-nums">{formatEuro(simTotalExpenses)}</p>
              {simTotalExpenses !== currentTotalExpenses && (
                <p className={`text-[11px] tabular-nums ${simTotalExpenses < currentTotalExpenses ? "text-emerald-500" : "text-orange-500"}`}>
                  {simTotalExpenses > currentTotalExpenses ? "+" : ""}{formatEuro(simTotalExpenses - currentTotalExpenses)}
                </p>
              )}
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Reste à vivre</span>
              <p className={`text-base font-bold tabular-nums ${simResteAVivre < 0 ? "text-destructive" : ""}`}>{formatEuro(simResteAVivre)}</p>
              {simResteAVivre !== currentResteAVivre && (
                <p className={`text-[11px] tabular-nums ${simResteAVivre > currentResteAVivre ? "text-emerald-500" : "text-orange-500"}`}>
                  {simResteAVivre > currentResteAVivre ? "+" : ""}{formatEuro(simResteAVivre - currentResteAVivre)}
                </p>
              )}
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Taux d'épargne</span>
              <p className="text-base font-bold tabular-nums">
                {simTotalIncome > 0 ? ((simResteAVivre / simTotalIncome) * 100).toFixed(1) : "0"}%
              </p>
            </div>
          </div>

          {/* Comparison chart */}
          {comparisonData.length > 0 && (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 5, right: 10, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} angle={-35} textAnchor="end" height={60} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${v}€`} axisLine={false} tickLine={false} width={55} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="actuel" name="Actuel" fill="hsl(var(--muted-foreground))" radius={[2, 2, 0, 0]} animationDuration={400} opacity={0.5} />
                  <Bar dataKey="simulation" name="Simulation" radius={[2, 2, 0, 0]} animationDuration={400}>
                    {comparisonData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
