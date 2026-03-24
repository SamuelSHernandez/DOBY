"use client";

import { useState } from "react";
import type { HomeSystem, SystemCategory } from "@/store/types";
import { yearsFractional } from "@/lib/dates";
import { formatDate } from "@/lib/dates";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import LifecycleBar from "@/components/shared/LifecycleBar";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";

interface Props {
  category: { key: SystemCategory; label: string };
  systems: HomeSystem[];
  onEdit: (system: HomeSystem) => void;
  onDelete: (id: string) => void;
}

function getCategoryStatus(systems: HomeSystem[]): { label: string; color: string; dotColor: string } {
  if (systems.length === 0) return { label: "INACTIVE", color: "text-text-tertiary", dotColor: "bg-text-tertiary" };

  let worstPct = 0;
  let hasIssue = false;

  for (const sys of systems) {
    if (sys.installDate && sys.estimatedLifeYears > 0) {
      const pct = (yearsFractional(sys.installDate) / sys.estimatedLifeYears) * 100;
      if (pct > worstPct) worstPct = pct;
      if (pct > 50) hasIssue = true;
    }
    if (sys.condition === "poor") hasIssue = true;
  }

  if (worstPct > 80) return { label: "PROTECTING", color: "text-oxblood", dotColor: "bg-oxblood" };
  if (hasIssue) return { label: "NOMINAL", color: "text-saffron", dotColor: "bg-saffron" };
  return { label: "NOMINAL", color: "text-sea-green", dotColor: "bg-sea-green" };
}

function getSummaryLine(systems: HomeSystem[]): string {
  if (systems.length === 0) return "No systems registered";

  for (const sys of systems) {
    if (sys.condition === "poor") return `${sys.name} needs attention`;
    if (sys.installDate && sys.estimatedLifeYears > 0) {
      const pct = (yearsFractional(sys.installDate) / sys.estimatedLifeYears) * 100;
      if (pct > 80) return `${sys.name} aging`;
    }
  }

  return "All circuits nominal";
}

export default function SystemCategoryCard({ category, systems, onEdit, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const status = getCategoryStatus(systems);
  const summary = getSummaryLine(systems);

  return (
    <div className="border border-border bg-surface">
      {/* Header — always visible, clickable to expand */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start justify-between p-4 text-left"
      >
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-text-primary">{category.label}</h3>
          <p className="mt-0.5 text-xs text-text-tertiary">{summary}</p>
        </div>
        <ChevronDown
          size={16}
          className={cn(
            "mt-0.5 shrink-0 text-text-tertiary transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      {/* Footer stats */}
      <div className="flex items-center justify-between border-t border-border/50 px-4 py-2 text-[11px] text-text-tertiary">
        <span>
          Devices: {systems.length} &middot; Circuits: {systems.length}
        </span>
        <span className={cn("flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider", status.color)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", status.dotColor)} />
          {status.label}
        </span>
      </div>

      {/* Expanded system list */}
      {expanded && systems.length > 0 && (
        <div className="border-t border-border">
          {systems.map((sys) => {
            const age = sys.installDate && sys.estimatedLifeYears > 0
              ? yearsFractional(sys.installDate)
              : 0;
            const lifePct = sys.estimatedLifeYears > 0
              ? Math.min(100, Math.round((age / sys.estimatedLifeYears) * 100))
              : 0;

            return (
              <div key={sys.id} className="border-b border-border/50 px-4 py-3 last:border-b-0">
                <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text-primary">{sys.name}</p>
                  <div className="mt-0.5 flex flex-wrap gap-3 text-[11px] text-text-tertiary">
                    {sys.installDate && <span>Installed {formatDate(sys.installDate)}</span>}
                    {lifePct > 0 && <span>{lifePct}% life</span>}
                    {sys.estimatedReplaceCost > 0 && <span>{formatCurrency(sys.estimatedReplaceCost)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(sys); }}
                    className="touch-target p-2 text-text-tertiary hover:text-text-primary"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(sys.id); }}
                    className="touch-target p-2 text-text-tertiary hover:text-oxblood"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                </div>
                {lifePct > 0 && (
                  <div className="mt-2">
                    <LifecycleBar percent={lifePct} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {expanded && systems.length === 0 && (
        <div className="border-t border-border px-4 py-4">
          <p className="text-xs text-text-tertiary">No systems in this category.</p>
        </div>
      )}
    </div>
  );
}
