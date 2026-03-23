"use client";

import { useState } from "react";
import { useDobyStore } from "@/store";
import { utilityTypes } from "@/store/defaults";
import { generateId } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EmptyState from "@/components/shared/EmptyState";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Plus, Trash2 } from "lucide-react";

export default function UtilityTracker() {
  const utilities = useDobyStore((s) => s.utilities);
  const addUtility = useDobyStore((s) => s.addUtility);
  const deleteUtility = useDobyStore((s) => s.deleteUtility);
  const [open, setOpen] = useState(false);

  // Group by type for averages
  const byType = utilities.reduce<Record<string, number[]>>((acc, u) => {
    if (!acc[u.type]) acc[u.type] = [];
    acc[u.type].push(u.amount);
    return acc;
  }, {});

  // Chart data: monthly totals sorted by date
  const monthlyTotals = utilities.reduce<Record<string, number>>((acc, u) => {
    acc[u.date] = (acc[u.date] || 0) + u.amount;
    return acc;
  }, {});
  const chartData = Object.entries(monthlyTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount }));

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addUtility({
      id: generateId(),
      type: fd.get("type") as string,
      amount: Number(fd.get("amount")) || 0,
      date: (fd.get("date") as string) || "",
    });
    setOpen(false);
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus size={14} />
          <span>Add Bill</span>
        </Button>
      </div>

      {Object.keys(byType).length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {Object.entries(byType).map(([type, amounts]) => {
            const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
            return (
              <div key={type} className="border border-border bg-surface p-3">
                <p className="text-[10px] uppercase tracking-wider text-text-tertiary">{type}</p>
                <p className="mt-1 text-sm font-semibold text-text-primary">{formatCurrency(avg)}/mo avg</p>
              </div>
            );
          })}
        </div>
      )}

      {chartData.length > 1 && (
        <div className="mb-6 border border-border bg-surface p-4">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
            Monthly Trend
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#3a3b40" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8a8b91" }} />
              <YAxis tick={{ fontSize: 10, fill: "#8a8b91" }} />
              <Tooltip
                contentStyle={{
                  background: "#222327",
                  border: "1px solid #3a3b40",
                  borderRadius: 0,
                  color: "#f0f0f2",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#3083DC"
                strokeWidth={2}
                dot={{ fill: "#3083DC", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {utilities.length === 0 ? (
        <EmptyState message="No utility bills logged — track electric, water, gas monthly" />
      ) : (
        <div className="space-y-2">
          {[...utilities]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((u) => (
              <div key={u.id} className="flex items-center justify-between border border-border bg-surface p-3">
                <div>
                  <span className="text-sm text-text-primary">{u.type}</span>
                  <span className="ml-3 text-[11px] text-text-tertiary">{u.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-text-primary">{formatCurrency(u.amount)}</span>
                  <button onClick={() => deleteUtility(u.id)} className="touch-target p-2 text-text-tertiary hover:text-oxblood">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-panel text-text-primary sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-wider">Add Utility Bill</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Type</Label>
              <Select name="type" defaultValue="Electric">
                <SelectTrigger className="mt-1 border-border bg-surface text-text-primary"><SelectValue /></SelectTrigger>
                <SelectContent className="border-border bg-panel text-text-primary">
                  {utilityTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Amount</Label>
                <Input name="amount" type="number" step="0.01" required className="mt-1 border-border bg-surface text-text-primary" />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Month (YYYY-MM)</Label>
                <Input name="date" type="month" required className="mt-1 border-border bg-surface text-text-primary" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} className="border-border text-text-secondary">Cancel</Button>
              <Button type="submit" size="sm">Add</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
