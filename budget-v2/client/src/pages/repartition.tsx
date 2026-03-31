import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfiles, useCategories, useExpenses } from "@/hooks/use-budget-data";
import MonthNav from "@/components/month-nav";
import { formatEuro, getCurrentMonth } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Scale, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import type { Profile, Expense } from "@shared/schema";

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-popover border border-border px-3 py-2 shadow-md text-sm">
      <p className="font-medium" style={{ color: payload[0]?.payload?.color || payload[0]?.color }}>{payload[0]?.payload?.name}</p>
      <p className="tabular-nums">{formatEuro(payload[0]?.value)}</p>
    </div>
  );
}

export default function RepartitionPage() {
  const [month, setMonth] = useState(getCurrentMonth);
  const { data: profiles } = useProfiles();
  const { data: categories } = useCategories();
  const { data: allExpenses } = useExpenses();

  const expenses = useMemo(() => allExpenses?.filter(e => e.month === month) || [], [allExpenses, month]);

  const totalIncome = useMemo(() => (profiles || []).reduce((s, p) => s + p.salary + p.otherIncome, 0), [profiles]);

  // Calculate what each person paid
  const paidByPerson = useMemo(() => {
    const map = new Map<number, number>();
    profiles?.forEach(p => map.set(p.id, 0));
    expenses.forEach(e => map.set(e.payerId, (map.get(e.payerId) || 0) + e.amount));
    return map;
  }, [profiles, expenses]);

  // Calculate what each person should pay (fair share)
  const fairShare = useMemo(() => {
    const map = new Map<number, number>();
    profiles?.forEach(p => map.set(p.id, 0));

    expenses.forEach(e => {
      if (e.expenseType === "personal") {
        map.set(e.payerId, (map.get(e.payerId) || 0) + e.amount);
        return;
      }
      // Shared expense
      const ps = profiles || [];
      if (ps.length < 2) return;

      if (e.splitMethod === "50-50") {
        const half = e.amount / 2;
        ps.forEach(p => map.set(p.id, (map.get(p.id) || 0) + half));
      } else if (e.splitMethod === "proportional") {
        const total = ps.reduce((s, p) => s + p.salary + p.otherIncome, 0);
        ps.forEach(p => {
          const ratio = total > 0 ? (p.salary + p.otherIncome) / total : 0.5;
          map.set(p.id, (map.get(p.id) || 0) + e.amount * ratio);
        });
      } else if (e.splitMethod === "custom") {
        const payerPct = (e.splitPercent || 50) / 100;
        ps.forEach(p => {
          const pct = p.id === e.payerId ? payerPct : (1 - payerPct) / (ps.length - 1);
          map.set(p.id, (map.get(p.id) || 0) + e.amount * pct);
        });
      }
    });
    return map;
  }, [profiles, expenses]);

  // Balance: positive = overpaid, negative = underpaid
  const balance = useMemo(() => {
    const map = new Map<number, number>();
    profiles?.forEach(p => {
      const paid = paidByPerson.get(p.id) || 0;
      const should = fairShare.get(p.id) || 0;
      map.set(p.id, paid - should);
    });
    return map;
  }, [profiles, paidByPerson, fairShare]);

  // Shared vs personal breakdown per person
  const breakdownByPerson = useMemo(() => {
    const map = new Map<number, { shared: number; personal: number }>();
    profiles?.forEach(p => map.set(p.id, { shared: 0, personal: 0 }));
    expenses.forEach(e => {
      const entry = map.get(e.payerId);
      if (entry) {
        if (e.expenseType === "personal") entry.personal += e.amount;
        else entry.shared += e.amount;
      }
    });
    return map;
  }, [profiles, expenses]);

  // Per-category contribution data
  const catContribData = useMemo(() => {
    if (!categories || !profiles) return [];
    const catMap = new Map<number, Map<number, number>>();
    categories.forEach(c => {
      const pm = new Map<number, number>();
      profiles.forEach(p => pm.set(p.id, 0));
      catMap.set(c.id, pm);
    });
    expenses.forEach(e => {
      const pm = catMap.get(e.categoryId);
      if (pm) pm.set(e.payerId, (pm.get(e.payerId) || 0) + e.amount);
    });
    return categories.filter(c => {
      const pm = catMap.get(c.id);
      return pm && Array.from(pm.values()).some(v => v > 0);
    }).map(c => {
      const pm = catMap.get(c.id)!;
      const row: any = { name: c.name, color: c.color };
      profiles.forEach(p => { row[p.name] = pm.get(p.id) || 0; });
      return row;
    });
  }, [categories, profiles, expenses]);

  const isBalanced = useMemo(() => {
    const vals = Array.from(balance.values());
    return vals.every(v => Math.abs(v) < 5);
  }, [balance]);

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-lg font-semibold flex items-center gap-2"><Scale className="w-5 h-5 text-primary" /> Répartition</h1>
        <MonthNav month={month} onChange={setMonth} />
      </div>

      {/* Balance status */}
      <Card className={isBalanced ? "border-emerald-500/30" : "border-orange-500/30"}>
        <CardContent className="py-4 px-5">
          <div className="flex items-center gap-2 mb-3">
            {isBalanced ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-orange-500" />}
            <span className="text-sm font-medium">{isBalanced ? "Répartition équilibrée" : "Répartition déséquilibrée"}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profiles?.map(p => {
              const paid = paidByPerson.get(p.id) || 0;
              const should = fairShare.get(p.id) || 0;
              const bal = balance.get(p.id) || 0;
              const incomeRatio = totalIncome > 0 ? ((p.salary + p.otherIncome) / totalIncome * 100) : 50;
              return (
                <div key={p.id} className="space-y-2 p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="font-medium text-sm">{p.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{incomeRatio.toFixed(0)}% des revenus</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">A payé</span><p className="font-medium tabular-nums">{formatEuro(paid)}</p></div>
                    <div><span className="text-muted-foreground">Part juste</span><p className="font-medium tabular-nums">{formatEuro(should)}</p></div>
                  </div>
                  <div className={`text-xs font-semibold tabular-nums ${bal > 5 ? "text-emerald-600 dark:text-emerald-400" : bal < -5 ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"}`}>
                    {bal > 5 ? `A trop payé de ${formatEuro(Math.abs(bal))}` : bal < -5 ? `Doit encore ${formatEuro(Math.abs(bal))}` : "Équilibré"}
                  </div>
                </div>
              );
            })}
          </div>
          {!isBalanced && profiles && profiles.length >= 2 && (() => {
            const p1 = profiles[0];
            const p2 = profiles[1];
            const b1 = balance.get(p1.id) || 0;
            const from = b1 < 0 ? p1 : p2;
            const to = b1 < 0 ? p2 : p1;
            const amount = Math.abs(b1);
            if (amount < 5) return null;
            return (
              <div className="mt-3 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-primary/5 border border-primary/10">
                <span className="text-sm font-medium" style={{ color: from.color }}>{from.name}</span>
                <ArrowRight className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium" style={{ color: to.color }}>{to.name}</span>
                <span className="text-sm font-bold tabular-nums text-primary ml-1">{formatEuro(amount)}</span>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Breakdown cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {profiles?.map(p => {
          const bd = breakdownByPerson.get(p.id) || { shared: 0, personal: 0 };
          const total = bd.shared + bd.personal;
          const pieData = [
            { name: "Communes", value: bd.shared, color: p.color },
            { name: "Personnelles", value: bd.personal, color: `${p.color}80` },
          ].filter(d => d.value > 0);
          return (
            <Card key={p.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  {p.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <div className="w-24 h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={20} outerRadius={40} dataKey="value" animationDuration={400}>
                        {pieData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} /> Communes : {formatEuro(bd.shared)}</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: `${p.color}80` }} /> Personnelles : {formatEuro(bd.personal)}</div>
                  <div className="font-semibold pt-1">Total : {formatEuro(total)}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Per-category stacked bar */}
      {catContribData.length > 0 && profiles && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Contribution par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catContribData} margin={{ top: 5, right: 10, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} angle={-35} textAnchor="end" height={60} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${v}€`} axisLine={false} tickLine={false} width={50} />
                  <Tooltip content={<ChartTooltip />} />
                  {profiles.map(p => (
                    <Bar key={p.id} dataKey={p.name} stackId="a" fill={p.color} radius={[0, 0, 0, 0]} animationDuration={400} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
