"use client";

import { useDobyStore } from "@/store";
import { formatRelative, daysUntil } from "@/lib/dates";
import { getSystemLifecyclePct } from "@/lib/system-health";
import { getSeasonalNote } from "@/lib/seasonal";
import { cn } from "@/lib/utils";

interface Advisory {
  title: string;
  description: string;
  timeContext: string;
  severity: "critical" | "caution" | "info";
}

export default function AdvisoriesPanel() {
  const systems = useDobyStore((s) => s.systems);

  const advisories: Advisory[] = [];

  for (const sys of systems) {
    if (sys.installDate && sys.estimatedLifeYears > 0) {
      const pct = getSystemLifecyclePct(sys.installDate, sys.estimatedLifeYears);

      if (pct > 80) {
        advisories.push({
          title: `${sys.name} approaching end of life`,
          description: `${sys.estimatedLifeYears}-year unit at ${Math.round(pct)}% lifecycle. Budget $${sys.estimatedReplaceCost.toLocaleString()} for replacement.`,
          timeContext: sys.lastServiceDate ? formatRelative(sys.lastServiceDate) : "",
          severity: pct > 90 ? "critical" : "caution",
        });
      }
    }

    // Warranty expiring soon
    if (sys.warrantyExpiration) {
      const days = daysUntil(sys.warrantyExpiration);
      if (days > 0 && days < 90) {
        advisories.push({
          title: `${sys.name} warranty expiring`,
          description: `Warranty expires in ${days} days. Schedule inspection before expiration.`,
          timeContext: `${days} days`,
          severity: "caution",
        });
      }
    }
  }

  // Seasonal advisory
  const seasonal = getSeasonalNote();
  advisories.push({
    title: seasonal.title,
    description: seasonal.description,
    timeContext: seasonal.label,
    severity: "info",
  });

  if (advisories.length === 0) {
    return (
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">Advisories</h2>
          <span className="border border-border px-1.5 py-0.5 text-[10px] text-text-tertiary">0</span>
        </div>
        <p className="py-6 text-xs text-text-tertiary">All clear — no advisories at this time.</p>
      </div>
    );
  }

  const sorted = [...advisories].sort((a, b) => {
    const order = { critical: 0, caution: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  const borderColors = {
    critical: "border-l-oxblood",
    caution: "border-l-saffron",
    info: "border-l-azure",
  };

  const dotColors = {
    critical: "text-oxblood",
    caution: "text-saffron",
    info: "text-azure",
  };

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">Advisories</h2>
        <span className="border border-border px-1.5 py-0.5 text-[10px] text-text-tertiary">{sorted.length}</span>
      </div>
      <div className="space-y-2">
        {sorted.slice(0, 4).map((adv, i) => (
          <div
            key={i}
            className={cn("border border-border border-l-[3px] bg-surface p-4", borderColors[adv.severity])}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-text-primary">
                <span className={cn("mr-1.5", dotColors[adv.severity])}>&#x2022;</span>
                {adv.title}
              </p>
              {adv.timeContext && (
                <span className="shrink-0 text-[11px] text-text-tertiary">{adv.timeContext}</span>
              )}
            </div>
            <p className="mt-1 text-xs text-text-tertiary">{adv.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
