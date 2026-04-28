"use client";

import Link from "next/link";
import { useDobyStore } from "@/store";
import { formatCurrency } from "@/lib/formatters";
import { utilityProviderMap } from "@/store/defaults";

function Sparkline({ data }: { data: number[] }) {
  const width = 120;
  const height = 32;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map(
      (v, i) =>
        `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 4) - 2}`
    )
    .join(" ");
  const lastX = width;
  const lastY = height - ((data[data.length - 1] - min) / range) * (height - 4) - 2;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
      <polyline
        points={points}
        fill="none"
        stroke="var(--d-text-dim)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r="2.5" fill="var(--d-text-dim)" />
    </svg>
  );
}

export default function UtilityCards() {
  const utilities = useDobyStore((s) => s.utilities);

  if (utilities.length === 0) return null;

  // Group by type, sort each by date
  const grouped: Record<string, { date: string; amount: number }[]> = {};
  for (const u of utilities) {
    if (!grouped[u.type]) grouped[u.type] = [];
    grouped[u.type].push({ date: u.date, amount: u.amount });
  }

  const cards = Object.entries(grouped).map(([type, bills]) => {
    const sorted = [...bills].sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1]?.amount ?? 0;
    const amounts = sorted.map((b) => b.amount);
    return {
      type,
      provider: utilityProviderMap[type] || "Provider",
      latest,
      data: amounts,
    };
  });

  return (
    <div className="mb-12">
      <h2 className="mb-4 text-sm font-semibold tracking-tight text-text-secondary">Utilities</h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.type}
            href="/utilities"
            className="rounded-[10px] border border-border bg-panel p-4 transition-all duration-150 hover:-translate-y-px hover:border-border-bright hover:bg-surface-hover"
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className="text-[13px] font-medium text-text-primary">{card.type}</p>
                <p className="mt-0.5 font-mono text-[11px] text-text-tertiary">{card.provider}</p>
              </div>
              <span className="font-mono text-base font-semibold text-text-muted">
                {formatCurrency(card.latest)}
              </span>
            </div>
            {card.data.length >= 2 ? (
              <Sparkline data={card.data} />
            ) : (
              <div className="flex h-8 items-end">
                <div className="h-px w-full bg-border-bright" />
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
