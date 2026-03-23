"use client";

import type { HomeSystem } from "@/store/types";
import { yearsFractional } from "@/lib/dates";
import { cn } from "@/lib/utils";

interface Props {
  systems: HomeSystem[];
}

function getStatus(sys: HomeSystem): { label: string; color: string } {
  if (!sys.installDate || sys.estimatedLifeYears <= 0) {
    return { label: "IDLE", color: "text-text-tertiary" };
  }
  const pct = (yearsFractional(sys.installDate) / sys.estimatedLifeYears) * 100;
  if (pct > 80) return { label: "CRITICAL", color: "text-oxblood" };
  if (pct > 50) return { label: "AGING", color: "text-saffron" };
  if (sys.condition === "excellent" || sys.condition === "good") {
    return { label: "ACTIVE", color: "text-sea-green" };
  }
  return { label: "IDLE", color: "text-text-tertiary" };
}

function getDotColor(sys: HomeSystem): string {
  const status = getStatus(sys);
  if (status.label === "ACTIVE") return "bg-sea-green";
  if (status.label === "AGING") return "bg-saffron";
  if (status.label === "CRITICAL") return "bg-oxblood";
  return "bg-text-tertiary";
}

export default function RoomSystemsList({ systems }: Props) {
  if (systems.length === 0) {
    return (
      <p className="py-6 text-xs text-text-tertiary">No systems linked to this room.</p>
    );
  }

  return (
    <div className="space-y-1">
      {systems.map((sys) => {
        const status = getStatus(sys);
        return (
          <div
            key={sys.id}
            className="flex items-center justify-between border border-border bg-surface px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className={cn("h-2 w-2 rounded-full", getDotColor(sys))} />
              <span className="text-sm text-text-primary">{sys.name}</span>
            </div>
            <span className={cn("text-[10px] font-semibold uppercase tracking-wider", status.color)}>
              {status.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
