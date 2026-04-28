"use client";

import { useState, useMemo } from "react";
import { useDobyStore } from "@/store";
import { useShallow } from "zustand/react/shallow";
import { useFeature } from "@/lib/useFeature";
import { calculateMonthlyPayment, calculateTotalMonthly } from "@/lib/mortgage";
import { daysUntil } from "@/lib/dates";
import { getSeasonalNote } from "@/lib/seasonal";
import { formatCurrency } from "@/lib/formatters";
import AlertBanner from "@/components/home/AlertBanner";
import RoomCompactCard from "@/components/home/RoomCompactCard";
import SystemHomeCard from "@/components/home/SystemHomeCard";
import UpcomingMaintenance from "@/components/home/UpcomingMaintenance";
import AdvisoriesPanel from "@/components/home/AdvisoriesPanel";
import UtilityCards from "@/components/home/UtilityCards";
import RoomFormDialog from "@/components/home/RoomFormDialog";

export default function HomePage() {
  const [expandedSystemId, setExpandedSystemId] = useState<string | null>(null);
  const { rooms, systems, property, mortgage, utilities } = useDobyStore(useShallow((s) => ({
    rooms: s.rooms, systems: s.systems, property: s.property,
    mortgage: s.mortgage, utilities: s.utilities,
  })));
  const showAlertBanner = useFeature("alertBanner");
  const showAdvisories = useFeature("advisories");

  const totalMonthly = useMemo(() => {
    const monthlyPI = calculateMonthlyPayment(mortgage.loanAmount, mortgage.interestRate, mortgage.termYears);
    return calculateTotalMonthly(monthlyPI, mortgage.propertyTaxAnnual, mortgage.homeInsuranceAnnual, mortgage.pmi);
  }, [mortgage]);

  const latestEnergy = useMemo(() => {
    const electricBills = utilities.filter((u) => u.type === "Electric").sort((a, b) => b.date.localeCompare(a.date));
    return electricBills.length > 0 ? `${electricBills[0].amount} kWh` : "—";
  }, [utilities]);

  const openTasks = useMemo(() =>
    systems.filter((s) => s.nextServiceDate && daysUntil(s.nextServiceDate) < 0).length,
    [systems]
  );

  const seasonalNote = getSeasonalNote();

  return (
    <div>
      {showAlertBanner && <AlertBanner />}

      {/* ── Header ── */}
      <div className="mb-12 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            {property.address || "DOBY"}
          </h1>
          <p className="mt-1 text-xs tracking-wide text-text-tertiary">
            {[
              property.address && property.address.split(",").slice(1).join(",").trim(),
              property.yearBuilt > 0 && `Built ${property.yearBuilt}`,
            ].filter(Boolean).join(" · ") || "Home Management"}
          </p>
        </div>
        <div className="flex items-center gap-6">
          {[
            { label: "Monthly Cost", val: totalMonthly > 0 ? formatCurrency(totalMonthly) : "—" },
            { label: "Energy", val: latestEnergy },
            { label: "Open Tasks", val: openTasks > 0 ? String(openTasks) : "—" },
          ].map((m) => (
            <div key={m.label} className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-border-bright">{m.label}</p>
              <p className={`mt-0.5 text-base font-semibold ${m.val === "—" ? "text-text-ghost" : "text-text-muted"}`}>
                {m.val}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Systems grid ── */}
      {systems.length > 0 && (
        <div className="mb-12">
          <div className="mb-4 flex items-center gap-2.5">
            <h2 className="text-sm font-semibold tracking-tight text-text-secondary">Systems</h2>
            <span className="rounded bg-surface px-[7px] py-[2px] text-[11px] text-text-tertiary">
              {systems.length}
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(expandedSystemId
              ? [
                  systems.find((s) => s.id === expandedSystemId)!,
                  ...systems.filter((s) => s.id !== expandedSystemId),
                ]
              : systems
            ).map((sys) => (
              <SystemHomeCard
                key={sys.id}
                system={sys}
                expanded={expandedSystemId === sys.id}
                onToggle={() =>
                  setExpandedSystemId((prev) => (prev === sys.id ? null : sys.id))
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Utilities ── */}
      <UtilityCards />

      {/* ── Rooms ── */}
      <div className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-semibold tracking-tight text-text-secondary">Rooms</h2>
            <span className="rounded bg-surface px-[7px] py-[2px] text-[11px] text-text-tertiary">
              {rooms.length}
            </span>
          </div>
          <RoomFormDialog />
        </div>
        {rooms.length === 0 ? (
          <p className="py-8 text-[13px] text-text-tertiary">No rooms configured. Add your first room to get started.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {rooms.map((room) => (
              <RoomCompactCard key={room.id} room={room} systems={systems} />
            ))}
          </div>
        )}
      </div>

      {/* ── Seasonal note ── */}
      {seasonalNote && (
        <div className="mb-12 flex items-start gap-3.5 rounded-[10px] border border-border bg-panel px-5 py-4">
          <span className="mt-px shrink-0 rounded bg-surface-raised px-2 py-[3px] text-[10px] uppercase tracking-wider text-text-dim">
            {seasonalNote.label}
          </span>
          <div>
            <p className="text-[13px] font-[450] text-text-muted">{seasonalNote.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-text-tertiary">{seasonalNote.description}</p>
          </div>
        </div>
      )}

      {/* ── Below-fold panels (feature-flagged) ── */}
      {showAdvisories && (
        <div className="space-y-6">
          <AdvisoriesPanel />
        </div>
      )}
    </div>
  );
}
