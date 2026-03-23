"use client";

import { useDobyStore } from "@/store";
import { daysUntil, formatRelative } from "@/lib/dates";
import { cn } from "@/lib/utils";

interface Task {
  name: string;
  location: string;
  dueText: string;
  daysAway: number;
}

export default function UpcomingMaintenance() {
  const systems = useDobyStore((s) => s.systems);
  const rooms = useDobyStore((s) => s.rooms);

  const tasks: Task[] = [];

  for (const sys of systems) {
    if (sys.nextServiceDate) {
      const days = daysUntil(sys.nextServiceDate);
      // Find which room(s) this system is in
      const room = rooms.find((r) => r.systemIds.includes(sys.id));
      const location = room?.name ?? "Whole home";

      let dueText: string;
      if (days < 0) {
        dueText = `${Math.abs(days)} days overdue`;
      } else if (days === 0) {
        dueText = "Today";
      } else if (days < 7) {
        dueText = `In ${days} days`;
      } else {
        dueText = formatRelative(sys.nextServiceDate);
      }

      tasks.push({ name: `${sys.name} service`, location, dueText, daysAway: days });
    }

    // Filter change tasks
    if (sys.filterSize && sys.filterChangeIntervalMonths && sys.lastServiceDate) {
      const daysSince = -daysUntil(sys.lastServiceDate);
      const intervalDays = sys.filterChangeIntervalMonths * 30;
      const daysRemaining = intervalDays - daysSince;
      if (daysRemaining < 30) {
        const room = rooms.find((r) => r.systemIds.includes(sys.id));
        tasks.push({
          name: `Replace ${sys.name} filter`,
          location: room?.name ?? "Whole home",
          dueText: daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `In ${daysRemaining} days`,
          daysAway: daysRemaining,
        });
      }
    }
  }

  const sorted = tasks.sort((a, b) => a.daysAway - b.daysAway).slice(0, 6);

  if (sorted.length === 0) {
    return (
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">Upcoming maintenance</h2>
          <span className="border border-border px-1.5 py-0.5 text-[10px] text-text-tertiary">0</span>
        </div>
        <p className="py-6 text-xs text-text-tertiary">No upcoming maintenance tasks. Add systems with service dates to see them here.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">Upcoming maintenance</h2>
        <span className="border border-border px-1.5 py-0.5 text-[10px] text-text-tertiary">{sorted.length}</span>
      </div>
      <div className="space-y-1">
        {sorted.map((task, i) => {
          const borderColor = task.daysAway < 0 ? "border-l-oxblood" : task.daysAway < 14 ? "border-l-saffron" : "border-l-border-bright";
          return (
            <div
              key={i}
              className={cn("flex items-center justify-between border border-border border-l-[3px] bg-surface px-4 py-3", borderColor)}
            >
              <div>
                <p className="text-sm text-text-primary">{task.name}</p>
                <p className="text-[11px] text-text-tertiary">{task.location}</p>
              </div>
              <span className={cn(
                "text-xs",
                task.daysAway < 0 ? "text-oxblood" : task.daysAway < 14 ? "text-saffron" : "text-text-tertiary"
              )}>
                {task.dueText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
