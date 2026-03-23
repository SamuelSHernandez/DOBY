"use client";

import type { HomeSystem, SystemCategory } from "@/store/types";
import { yearsFractional } from "@/lib/dates";
import { cn } from "@/lib/utils";

interface Props {
  category: { key: SystemCategory; label: string };
  systems: HomeSystem[];
}

function getCategoryStatus(systems: HomeSystem[]): { label: string; color: string; dotColor: string } {
  if (systems.length === 0) return { label: "INACTIVE", color: "text-text-tertiary", dotColor: "bg-text-tertiary" };

  let worstPct = 0;
  let hasIssue = false;
  let issueDesc = "";

  for (const sys of systems) {
    if (sys.installDate && sys.estimatedLifeYears > 0) {
      const pct = (yearsFractional(sys.installDate) / sys.estimatedLifeYears) * 100;
      if (pct > worstPct) {
        worstPct = pct;
        if (pct > 50) {
          hasIssue = true;
          issueDesc = `${sys.name} aging`;
        }
      }
    }
    if (sys.condition === "poor") {
      hasIssue = true;
      issueDesc = `${sys.name} in poor condition`;
    }
  }

  if (worstPct > 80) return { label: "PROTECTING", color: "text-oxblood", dotColor: "bg-oxblood" };
  if (hasIssue) return { label: "NOMINAL", color: "text-saffron", dotColor: "bg-saffron" };
  return { label: "NOMINAL", color: "text-sea-green", dotColor: "bg-sea-green" };
}

function getSummaryLine(systems: HomeSystem[]): string {
  if (systems.length === 0) return "No systems registered";

  for (const sys of systems) {
    if (sys.filterSize && sys.filterChangeIntervalMonths) {
      return "Filter replacement needed";
    }
    if (sys.condition === "poor") {
      return `${sys.name} needs attention`;
    }
    if (sys.installDate && sys.estimatedLifeYears > 0) {
      const pct = (yearsFractional(sys.installDate) / sys.estimatedLifeYears) * 100;
      if (pct > 80) return `${sys.name} aging`;
    }
  }

  const allGood = systems.every((s) => s.condition === "excellent" || s.condition === "good" || s.condition === "unknown");
  if (allGood) return "All circuits nominal";
  return `${systems.length} device${systems.length !== 1 ? "s" : ""} tracked`;
}

export default function SystemCategoryCard({ category, systems }: Props) {
  const status = getCategoryStatus(systems);
  const summary = getSummaryLine(systems);

  return (
    <div className="border border-border bg-surface p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{category.label}</h3>
          <p className="mt-0.5 text-xs text-text-tertiary">{summary}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-text-tertiary">
        <span>
          Devices: {systems.length} &middot; Circuits: {systems.length}
        </span>
        <span className={cn("flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider", status.color)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", status.dotColor)} />
          {status.label}
        </span>
      </div>
    </div>
  );
}
