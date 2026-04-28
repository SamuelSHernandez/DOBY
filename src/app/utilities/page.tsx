"use client";

import { useState } from "react";
import { useDobyStore } from "@/store";
import { utilityTypes } from "@/store/defaults";
import { generateId } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters";
import PageHeader from "@/components/layout/PageHeader";
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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Build last 24 months as selectable options, most recent first
function buildMonthOptions() {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    options.push({ value, label });
  }
  return options;
}
const PERIOD_OPTIONS = buildMonthOptions();

import { utilityProviderMap } from "@/store/defaults";

interface UtilityGroup {
  type: string;
  provider: string;
  latest: number;
  prev: number | null;
  avg: number;
  months: number[];
  currentMonthIndex: number;
  billCount: number;
}

function buildGroup(type: string, bills: { date: string; amount: number }[]): UtilityGroup {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const months = new Array(12).fill(0);
  for (const bill of bills) {
    const d = new Date(bill.date);
    if (d.getFullYear() === currentYear) {
      months[d.getMonth()] = bill.amount;
    }
  }

  const sorted = [...bills].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0]?.amount ?? 0;
  const prev = sorted[1]?.amount ?? null;

  const nonZero = bills.map((b) => b.amount).filter((a) => a > 0);
  const avg = nonZero.length > 0 ? Math.round(nonZero.reduce((s, v) => s + v, 0) / nonZero.length) : 0;

  return {
    type,
    provider: utilityProviderMap[type] || "Provider",
    latest,
    prev,
    avg,
    months,
    currentMonthIndex: currentMonth,
    billCount: bills.length,
  };
}

export default function UtilitiesPage() {
  const utilities = useDobyStore((s) => s.utilities);
  const addUtility = useDobyStore((s) => s.addUtility);
  const deleteUtility = useDobyStore((s) => s.deleteUtility);
  const [open, setOpen] = useState(false);

  // Group bills by type
  const grouped: Record<string, { id: string; date: string; amount: number }[]> = {};
  for (const u of utilities) {
    if (!grouped[u.type]) grouped[u.type] = [];
    grouped[u.type].push({ id: u.id, date: u.date, amount: u.amount });
  }

  const cards = Object.entries(grouped).map(([type, bills]) => buildGroup(type, bills));

  // Total monthly cost
  const totalMonthly = cards.reduce((s, c) => s + c.latest, 0);

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addUtility({
      id: generateId(),
      type: fd.get("type") as string,
      amount: Number(fd.get("amount")) || 0,
      date: fd.get("period") as string,
    });
    setOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Utilities"
        subtitle={totalMonthly > 0 ? `${formatCurrency(totalMonthly)}/mo latest` : undefined}
        action={
          <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
            <Plus size={14} />
            <span>Add Bill</span>
          </Button>
        }
      />

      {utilities.length === 0 ? (
        <EmptyState message="No utility bills logged — track electric, water, gas, internet, and more" />
      ) : (
        <>
          {/* ── Bar chart cards ── */}
          <div className="flex flex-col gap-3">
            {cards.map((card) => {
              const diff = card.prev != null ? card.latest - card.prev : null;
              const diffStr = diff != null ? `${diff >= 0 ? "+" : ""}${diff} vs last mo` : null;
              const max = Math.max(...card.months, 1);

              return (
                <div
                  key={card.type}
                  className="rounded-[10px] border border-border bg-panel px-6 py-5"
                >
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <p className="text-[15px] font-medium text-text-primary">{card.type}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-text-tertiary">{card.provider}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[22px] font-semibold text-text-secondary">
                        {formatCurrency(card.latest)}
                      </p>
                      {(diffStr || card.avg > 0) && (
                        <p className="mt-0.5 font-mono text-[11px] text-text-dim">
                          {[diffStr, card.avg > 0 && `${formatCurrency(card.avg)} avg`]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bar chart */}
                  <div className="flex items-end gap-1" style={{ height: 60 }}>
                    {card.months.map((v, i) => {
                      const h = (v / max) * 56 + 4;
                      return (
                        <div key={i} className="flex flex-1 flex-col items-center">
                          <div
                            className="w-full rounded-sm transition-all duration-300"
                            style={{
                              height: h,
                              background: i === card.currentMonthIndex ? "var(--d-text-dim)" : v > 0 ? "var(--d-surface-dim)" : "var(--d-surface-hover)",
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Month labels */}
                  <div className="mt-1.5 flex gap-1">
                    {MONTHS.map((m) => (
                      <span key={m} className="flex-1 text-center font-mono text-[9px] text-text-ghost">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Bill history ── */}
          <div className="mt-8">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-primary">
              Bill History
            </h2>
            <div className="space-y-1">
              {[...utilities]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between border border-border bg-surface px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-text-primary">{u.type}</span>
                      <span className="font-mono text-[11px] text-text-tertiary">{u.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold text-text-primary">
                        {formatCurrency(u.amount)}
                      </span>
                      <button
                        onClick={() => deleteUtility(u.id)}
                        className="touch-target p-2 text-text-tertiary hover:text-oxblood"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}

      {/* ── Add bill dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-panel text-text-primary sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-wider">
              Add Utility Bill
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Type</Label>
              <Select name="type" defaultValue="Electric">
                <SelectTrigger className="mt-1 border-border bg-surface text-text-primary">
                  <SelectValue />
                </SelectTrigger>
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
                <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Period</Label>
                <Select name="period" defaultValue={PERIOD_OPTIONS[0].value}>
                  <SelectTrigger className="mt-1 border-border bg-surface text-text-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-panel text-text-primary">
                    {PERIOD_OPTIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} className="border-border text-text-secondary">
                Cancel
              </Button>
              <Button type="submit" size="sm">Add</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
