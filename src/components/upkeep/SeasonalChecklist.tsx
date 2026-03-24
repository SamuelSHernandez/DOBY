"use client";

import { useDobyStore } from "@/store";
import { seasonalTaskPresets } from "@/store/defaults";
import { currentYear } from "@/lib/dates";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const seasons = ["Spring", "Summer", "Fall", "Winter"] as const;

function getCurrentSeason(): typeof seasons[number] {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Fall";
  return "Winter";
}

export default function SeasonalChecklist() {
  const tasks = useDobyStore((s) => s.seasonalTasks);
  const toggle = useDobyStore((s) => s.toggleSeasonalTask);
  const year = currentYear();
  const current = getCurrentSeason();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {seasons.map((season) => {
        const isCurrent = season === current;
        const completed = seasonalTaskPresets[season].filter(
          (t) => tasks[`${year}-${season}-${t}`]
        ).length;
        const total = seasonalTaskPresets[season].length;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

        return (
          <div
            key={season}
            className={cn(
              "border bg-surface p-4",
              isCurrent ? "border-azure" : "border-border"
            )}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className={cn(
                "text-xs font-bold uppercase tracking-wider",
                isCurrent ? "text-azure" : "text-text-primary"
              )}>
                {season} {year}
                {isCurrent && <span className="ml-2 text-[10px] font-normal normal-case tracking-normal text-azure">Current</span>}
              </h3>
              <span className="text-[10px] text-text-tertiary">{pct}%</span>
            </div>

            {/* Progress bar */}
            <div className="mb-3 h-1 w-full bg-carbon">
              <div
                className={cn("h-full transition-all", pct === 100 ? "bg-sea-green" : "bg-azure")}
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="space-y-2">
              {seasonalTaskPresets[season].map((task) => {
                const key = `${year}-${season}-${task}`;
                const checked = !!tasks[key];
                return (
                  <label
                    key={key}
                    className="flex min-h-[44px] cursor-pointer items-center gap-3 py-1.5"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggle(key)}
                    />
                    <span
                      className={`text-sm ${
                        checked ? "text-text-tertiary line-through" : "text-text-secondary"
                      }`}
                    >
                      {task}
                    </span>
                  </label>
                );
              })}
            </div>

            <p className="mt-3 text-[10px] text-text-tertiary">
              {completed} / {total} completed
              {pct === 100 && <span className="ml-2 text-sea-green">All done</span>}
            </p>
          </div>
        );
      })}
    </div>
  );
}
