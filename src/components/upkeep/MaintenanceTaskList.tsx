"use client";

import { useDobyStore } from "@/store";
import { daysUntil, formatRelative } from "@/lib/dates";
import { cn } from "@/lib/utils";

interface MaintenanceTask {
  name: string;
  location: string;
  daysAway: number;
  dueText: string;
  priority: "high" | "medium" | "low";
}

export default function MaintenanceTaskList() {
  const systems = useDobyStore((s) => s.systems);
  const rooms = useDobyStore((s) => s.rooms);
  const projects = useDobyStore((s) => s.projects);

  const tasks: MaintenanceTask[] = [];

  // System service dates
  for (const sys of systems) {
    if (sys.nextServiceDate) {
      const days = daysUntil(sys.nextServiceDate);
      const room = rooms.find((r) => r.systemIds.includes(sys.id));

      let dueText: string;
      if (days < 0) dueText = `${Math.abs(days)} days overdue`;
      else if (days === 0) dueText = "Today";
      else if (days < 7) dueText = `In ${days} days`;
      else if (days < 30) dueText = `In ${Math.round(days / 7)} weeks`;
      else dueText = `In ${Math.round(days / 30)} months`;

      const priority: "high" | "medium" | "low" = days < 0 ? "high" : days < 30 ? "medium" : "low";

      tasks.push({
        name: sys.name.includes("filter") ? `Replace ${sys.name} filter` : `${sys.name} service`,
        location: room?.name ?? "Whole home",
        daysAway: days,
        dueText,
        priority,
      });
    }

    // Filter changes
    if (sys.filterSize && sys.filterChangeIntervalMonths && sys.lastServiceDate) {
      const daysSince = -daysUntil(sys.lastServiceDate);
      const intervalDays = sys.filterChangeIntervalMonths * 30;
      const daysRemaining = intervalDays - daysSince;
      if (daysRemaining < 60) {
        const room = rooms.find((r) => r.systemIds.includes(sys.id));
        tasks.push({
          name: `Replace ${sys.name} filter`,
          location: room?.name ?? "Whole home",
          daysAway: daysRemaining,
          dueText: daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `In ${daysRemaining} days`,
          priority: daysRemaining < 0 ? "high" : daysRemaining < 14 ? "medium" : "low",
        });
      }
    }
  }

  // Active projects
  for (const proj of projects) {
    if (proj.status === "in-progress" || proj.status === "planned") {
      if (proj.endDate) {
        const days = daysUntil(proj.endDate);
        tasks.push({
          name: proj.name,
          location: "Project",
          daysAway: days,
          dueText: days < 0 ? `${Math.abs(days)} days overdue` : `In ${Math.round(days / 30)} months`,
          priority: days < 0 ? "high" : "medium",
        });
      }
    }
  }

  const sorted = tasks.sort((a, b) => a.daysAway - b.daysAway);

  const borderColors = { high: "border-l-oxblood", medium: "border-l-saffron", low: "border-l-azure" };
  const badgeColors = { high: "border-oxblood text-oxblood", medium: "border-saffron text-saffron", low: "border-azure text-azure" };
  const dueColors = { high: "text-oxblood", medium: "text-saffron", low: "text-text-tertiary" };

  if (sorted.length === 0) {
    return <p className="py-8 text-sm text-text-tertiary">No maintenance tasks. Add systems with service dates to populate this view.</p>;
  }

  return (
    <div className="space-y-2">
      {sorted.map((task, i) => (
        <div
          key={i}
          className={cn("flex items-center justify-between border border-border border-l-[3px] bg-surface px-4 py-4", borderColors[task.priority])}
        >
          <div>
            <p className="text-sm font-medium text-text-primary">{task.name}</p>
            <p className="mt-0.5 text-[11px] text-text-tertiary">{task.location}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn("text-xs", dueColors[task.priority])}>{task.dueText}</span>
            <span className={cn("border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", badgeColors[task.priority])}>
              {task.priority}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
