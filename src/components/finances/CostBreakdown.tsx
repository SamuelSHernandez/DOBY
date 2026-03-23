"use client";

import { useDobyStore } from "@/store";
import { formatCurrency } from "@/lib/formatters";

interface CostItem {
  label: string;
  amount: number;
  color: string;
}

export default function CostBreakdown() {
  const mortgage = useDobyStore((s) => s.mortgage);
  const expenses = useDobyStore((s) => s.expenses);
  const utilities = useDobyStore((s) => s.utilities);

  const items: CostItem[] = [];

  // Utilities by type (monthly average)
  const utilByType: Record<string, number[]> = {};
  for (const u of utilities) {
    if (!utilByType[u.type]) utilByType[u.type] = [];
    utilByType[u.type].push(u.amount);
  }
  for (const [type, amounts] of Object.entries(utilByType)) {
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const color = type === "Electric" || type === "Gas" ? "#3083DC" : type === "Water" || type === "Sewer" ? "#058C42" : "#8a8b91";
    items.push({ label: type === "Electric" || type === "Gas" ? `HVAC / ${type}` : type, amount: Math.round(avg), color });
  }

  // Insurance monthly
  if (mortgage.homeInsuranceAnnual > 0) {
    items.push({ label: "Insurance", amount: Math.round(mortgage.homeInsuranceAnnual / 12), color: "#FE9000" });
  }

  // Maintenance reserve (from expenses average)
  if (expenses.length > 0) {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const months = new Set(expenses.map((e) => e.date.slice(0, 7))).size || 1;
    items.push({ label: "Maintenance reserve", amount: Math.round(total / months), color: "#c8c9cc" });
  }

  const sorted = items.sort((a, b) => b.amount - a.amount);
  const maxAmount = sorted.length > 0 ? sorted[0].amount : 1;

  if (sorted.length === 0) {
    return <p className="py-6 text-xs text-text-tertiary">No cost data yet. Add utility bills and expenses to see breakdowns.</p>;
  }

  return (
    <div>
      <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-text-primary">Cost breakdown</h2>
      <div className="space-y-3">
        {sorted.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm text-text-secondary">{item.label}</span>
              <span className="text-sm font-semibold text-text-primary">{formatCurrency(item.amount)}</span>
            </div>
            <div className="h-2 w-full bg-carbon">
              <div
                className="h-full transition-all"
                style={{
                  width: `${(item.amount / maxAmount) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
