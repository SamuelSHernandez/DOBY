"use client";

import { useDobyStore } from "@/store";
import { daysUntil, yearsFractional } from "@/lib/dates";

interface Alert {
  title: string;
  description: string;
  daysOverdue: number;
}

export default function AlertBanner() {
  const systems = useDobyStore((s) => s.systems);

  const alerts: Alert[] = [];

  for (const sys of systems) {
    // Overdue service
    if (sys.nextServiceDate) {
      const days = daysUntil(sys.nextServiceDate);
      if (days < 0) {
        alerts.push({
          title: `${sys.name} service overdue`,
          description: `Scheduled service was ${Math.abs(days)} days ago. Schedule maintenance soon.`,
          daysOverdue: Math.abs(days),
        });
      }
    }

    // Critical lifecycle
    if (sys.installDate && sys.estimatedLifeYears > 0) {
      const age = yearsFractional(sys.installDate);
      const pct = (age / sys.estimatedLifeYears) * 100;
      if (pct > 90) {
        alerts.push({
          title: `${sys.name} critically low`,
          description: `At ${Math.round(pct)}% life — ${sys.notes || `approaching end of estimated ${sys.estimatedLifeYears}-year lifespan`}. Replace within 2 weeks.`,
          daysOverdue: Math.round(pct),
        });
      }
    }

    // Filter change overdue
    if (sys.filterSize && sys.filterChangeIntervalMonths && sys.lastServiceDate) {
      const daysSince = -daysUntil(sys.lastServiceDate);
      const intervalDays = sys.filterChangeIntervalMonths * 30;
      if (daysSince > intervalDays) {
        alerts.push({
          title: `${sys.name} filter critically low`,
          description: `Filter at ${Math.round((daysSince / intervalDays) * 100)}% life — showing reduced airflow. Replace within 2 weeks.`,
          daysOverdue: daysSince - intervalDays,
        });
      }
    }
  }

  if (alerts.length === 0) return null;

  // Show worst alert
  const worst = alerts.sort((a, b) => b.daysOverdue - a.daysOverdue)[0];

  return (
    <div className="mb-6 flex items-start gap-4 border border-oxblood/30 bg-oxblood/5 p-5">
      <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-oxblood" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text-primary">{worst.title}</p>
        <p className="mt-1 text-xs text-text-secondary">{worst.description}</p>
      </div>
      <span className="shrink-0 text-sm text-oxblood">
        {worst.daysOverdue} days overdue
      </span>
    </div>
  );
}
