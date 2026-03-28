"use client";

import type { HomeSystem } from "@/store/types";
import { yearsFractional, daysUntil } from "@/lib/dates";
import { cn } from "@/lib/utils";

interface Props {
  systems: HomeSystem[];
}

function getStatus(sys: HomeSystem): { label: string; dotColor: string; detail: string } {
  if (!sys.installDate || sys.estimatedLifeYears <= 0) {
    return { label: "IDLE", dotColor: "bg-text-tertiary", detail: "no install date" };
  }

  const age = yearsFractional(sys.installDate);
  const life = sys.estimatedLifeYears;
  const pct = (age / life) * 100;
  const ageStr = `${Math.round(age)}yr of ${life}yr`;

  // Service info
  let serviceStr = "";
  if (sys.nextServiceDate) {
    const days = daysUntil(sys.nextServiceDate);
    if (days < 0) serviceStr = "service overdue";
    else if (days < 30) serviceStr = `service in ${days}d`;
    else if (days < 365) serviceStr = `service in ${Math.round(days / 30)}mo`;
  }

  const suffix = serviceStr ? ` · ${serviceStr}` : "";

  if (pct > 80) return { label: "CRITICAL", dotColor: "bg-oxblood", detail: `${ageStr} · replacement due${suffix}` };
  if (pct > 50) return { label: "AGING", dotColor: "bg-saffron", detail: `${ageStr} · aging${suffix}` };
  return { label: "ACTIVE", dotColor: "bg-sea-green", detail: `${ageStr}${suffix}` };
}

export default function RoomSystemsList({ systems }: Props) {
  if (systems.length === 0) {
    return (
      <p className="py-4 text-xs text-text-tertiary">No systems linked — manage on Systems page</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {systems.map((sys) => {
        const status = getStatus(sys);
        return (
          <span
            key={sys.id}
            className="inline-flex items-center gap-1.5 border border-border bg-surface px-2.5 py-1 text-[11px]"
            title={`${sys.name} · ${status.detail}`}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", status.dotColor)} />
            <span className="text-text-primary">{sys.name}</span>
            <span className="text-[9px] text-text-tertiary">{status.detail}</span>
          </span>
        );
      })}
    </div>
  );
}
