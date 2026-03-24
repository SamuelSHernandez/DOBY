"use client";

import type { HomeSystem } from "@/store/types";
import { yearsFractional } from "@/lib/dates";

interface Props {
  system: HomeSystem;
}

function LifeBar({ age, lifespan }: { age: number; lifespan: number }) {
  const usedPct = Math.min((age / lifespan) * 100, 100);
  const remainingPct = 100 - usedPct;
  // Color: green when lots of life left, warm when depleted
  const hue = 90 + remainingPct * 0.5; // warm → green
  const sat = 20 + remainingPct * 0.3;
  const color = `hsl(${Math.min(hue, 140)}, ${sat}%, 40%)`;

  return (
    <div className="h-[3px] w-full overflow-hidden rounded-sm bg-[#1a1a1d]">
      <div
        className="h-full rounded-sm transition-all duration-500"
        style={{ width: `${remainingPct}%`, background: color }}
      />
    </div>
  );
}

export default function SystemHomeCard({ system }: Props) {
  const age = system.installDate ? yearsFractional(system.installDate) : 0;
  const lifespan = system.estimatedLifeYears || 15;
  const remaining = Math.max(0, Math.round(100 - Math.min((age / lifespan) * 100, 100)));

  const detail = system.notes || system.brand || system.condition || "—";
  const nextService = system.nextServiceDate
    ? `Service scheduled`
    : null;

  return (
    <div className="flex cursor-pointer flex-col gap-3 rounded-[10px] border border-[#18181b] bg-[#0d0d0f] px-[18px] py-4 transition-all duration-150 hover:-translate-y-px hover:border-[#27272a] hover:bg-[#131316]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium text-[#d4d4d8]">{system.name}</p>
          <p className="mt-0.5 text-[11px] text-[#3f3f46]">
            {detail.length > 24 ? detail.slice(0, 24) + "…" : detail}
          </p>
        </div>
        <span className="ml-3 shrink-0 text-[11px] text-[#27272a]">{remaining}%</span>
      </div>

      <LifeBar age={age} lifespan={lifespan} />

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[#27272a]">
          {Math.round(age)} yr of ~{lifespan} yr est.
        </span>
        {nextService && (
          <span className="rounded-[3px] bg-[#141416] px-[7px] py-[2px] text-[10px] text-[#52525b]">
            {nextService}
          </span>
        )}
      </div>
    </div>
  );
}
