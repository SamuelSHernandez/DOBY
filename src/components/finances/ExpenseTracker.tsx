"use client";

import { useState } from "react";
import { useDobyStore } from "@/store";
import type { Expense } from "@/store/types";
import { expenseCategories } from "@/store/defaults";
import { generateId } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters";
import { formatDate } from "@/lib/dates";
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
import { Plus, Trash2 } from "lucide-react";

export default function ExpenseTracker() {
  const expenses = useDobyStore((s) => s.expenses);
  const addExpense = useDobyStore((s) => s.addExpense);
  const deleteExpense = useDobyStore((s) => s.deleteExpense);
  const [open, setOpen] = useState(false);

  // Category totals
  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addExpense({
      id: generateId(),
      description: fd.get("description") as string,
      category: fd.get("category") as string,
      amount: Number(fd.get("amount")) || 0,
      date: (fd.get("date") as string) || "",
    });
    setOpen(false);
  }

  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus size={14} />
          <span>Add Expense</span>
        </Button>
      </div>

      {Object.keys(byCategory).length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {Object.entries(byCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, total]) => (
              <div key={cat} className="border border-border bg-surface p-3">
                <p className="text-[10px] uppercase tracking-wider text-text-tertiary">{cat}</p>
                <p className="mt-1 text-sm font-semibold text-text-primary">{formatCurrency(total)}</p>
              </div>
            ))}
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState message="No expenses recorded — track maintenance, repairs, improvements" />
      ) : (
        <div className="space-y-2">
          {sorted.map((exp) => (
            <div key={exp.id} className="flex items-center justify-between border border-border bg-surface p-3">
              <div>
                <p className="text-sm text-text-primary">{exp.description}</p>
                <div className="mt-1 flex gap-3 text-[11px] text-text-tertiary">
                  <span>{exp.category}</span>
                  <span>{formatDate(exp.date)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-text-primary">{formatCurrency(exp.amount)}</span>
                <button onClick={() => deleteExpense(exp.id)} className="touch-target p-2 text-text-tertiary hover:text-oxblood">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-panel text-text-primary sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-wider">Add Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Description</Label>
              <Input name="description" required className="mt-1 border-border bg-surface text-text-primary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Amount</Label>
                <Input name="amount" type="number" step="0.01" required className="mt-1 border-border bg-surface text-text-primary" />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Date</Label>
                <Input name="date" type="date" className="mt-1 border-border bg-surface text-text-primary" />
              </div>
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Category</Label>
              <Select name="category" defaultValue="Maintenance">
                <SelectTrigger className="mt-1 border-border bg-surface text-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-panel text-text-primary">
                  {expenseCategories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
