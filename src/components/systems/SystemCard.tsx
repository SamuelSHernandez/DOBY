"use client";

import type { HomeSystem } from "@/store/types";
import { formatDate } from "@/lib/dates";
import { formatCurrency } from "@/lib/formatters";
import { getSystemLifecyclePct, getHealthVariant } from "@/lib/system-health";
import LifecycleBar from "@/components/shared/LifecycleBar";
import StatusBadge from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";

interface Props {
  system: HomeSystem;
  onClick: () => void;
}

export default function SystemCard({ system, onClick }: Props) {
  const lifePct = getSystemLifecyclePct(system.installDate, system.estimatedLifeYears);
  const remaining = Math.max(0, system.estimatedLifeYears - (lifePct * system.estimatedLifeYears / 100));

  const statusVariant = getHealthVariant(lifePct);
  const borderColor =
    statusVariant === "critical" ? "border-l-oxblood"
      : statusVariant === "caution" ? "border-l-saffron"
      : "border-l-sea-green";
  const statusLabel =
    statusVariant === "critical" ? "Critical" : statusVariant === "caution" ? "Aging" : "Nominal";

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
