"use client";

import { useDobyStore } from "@/store";
import { seasonalTaskPresets } from "@/store/defaults";
import { currentYear } from "@/lib/dates";
import { Checkbox } from "@/components/ui/checkbox";

const seasons = ["Spring", "Summer", "Fall", "Winter"] as const;

export default function SeasonalChecklist() {
  const tasks = useDobyStore((s) => s.seasonalTasks);
  const toggle = useDobyStore((s) => s.toggleSeasonalTask);
  const year = currentYear();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {seasons.map((season) => (
        <div key={season} className="border border-border bg-surface p-4">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-primary">
            {season} {year}
          </h3>
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
                      checked
                        ? "text-text-tertiary line-through"
                        : "text-text-secondary"
                    }`}
                  >
                    {task}
                  </span>
                </label>
              );
            })}
          </div>
          <p className="mt-3 text-[10px] text-text-tertiary">
            {seasonalTaskPresets[season].filter(
              (t) => tasks[`${year}-${season}-${t}`]
            ).length}{" "}
            / {seasonalTaskPresets[season].length} completed
          </p>
        </div>
      ))}
    </div>
  );
}
