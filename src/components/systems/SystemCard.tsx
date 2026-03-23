"use client";

import type { HomeSystem } from "@/store/types";
import { formatDate } from "@/lib/dates";
import { formatCurrency } from "@/lib/formatters";
import { yearsFractional } from "@/lib/dates";
import LifecycleBar from "@/components/shared/LifecycleBar";
import StatusBadge from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";

interface Props {
  system: HomeSystem;
  onClick: () => void;
}

export default function SystemCard({ system, onClick }: Props) {
  const age = system.installDate ? yearsFractional(system.installDate) : 0;
  const lifePct = system.estimatedLifeYears > 0
    ? Math.min(100, (age / system.estimatedLifeYears) * 100)
    : 0;
  const remaining = Math.max(0, system.estimatedLifeYears - age);

  const borderColor =
    lifePct > 80
      ? "border-l-oxblood"
      : lifePct > 50
        ? "border-l-saffron"
        : "border-l-sea-green";

  const statusVariant =
    lifePct > 80 ? "critical" : lifePct > 50 ? "caution" : "nominal";
  const statusLabel =
    lifePct > 80 ? "Critical" : lifePct > 50 ? "Aging" : "Nominal";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full border border-border border-l-[3px] bg-surface p-4 text-left transition-colors hover:border-border-bright",
        borderColor
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-text-primary">{system.name}</span>
        <StatusBadge label={statusLabel} variant={statusVariant} />
      </div>

      <LifecycleBar percent={lifePct} />

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-text-tertiary">
        <div>
          <span className="block text-[10px] uppercase tracking-wider">Installed</span>
          {formatDate(system.installDate)}
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wider">Next Service</span>
          {formatDate(system.nextServiceDate)}
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wider">Remaining</span>
          {remaining.toFixed(1)} years
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wider">Replace Cost</span>
          {formatCurrency(system.estimatedReplaceCost)}
        </div>
      </div>
    </button>
  );
}
