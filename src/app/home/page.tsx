"use client";

import { useState } from "react";
import { useDobyStore } from "@/store";
import { useFeature } from "@/lib/useFeature";
import { calculateMonthlyPayment, calculateTotalMonthly } from "@/lib/mortgage";
import { daysUntil } from "@/lib/dates";
import { formatCurrency } from "@/lib/formatters";
import AlertBanner from "@/components/home/AlertBanner";
import RoomCompactCard from "@/components/home/RoomCompactCard";
import SystemHomeCard from "@/components/home/SystemHomeCard";
import UpcomingMaintenance from "@/components/home/UpcomingMaintenance";
import AdvisoriesPanel from "@/components/home/AdvisoriesPanel";
import AskDoby from "@/components/home/AskDoby";
import UtilityCards from "@/components/home/UtilityCards";
import RoomFormDialog from "@/components/home/RoomFormDialog";

export default function HomePage() {
  const [expandedSystemId, setExpandedSystemId] = useState<string | null>(null);
  const rooms = useDobyStore((s) => s.rooms);
  const systems = useDobyStore((s) => s.systems);
  const property = useDobyStore((s) => s.property);
  const mortgage = useDobyStore((s) => s.mortgage);
  const utilities = useDobyStore((s) => s.utilities);
  const seasonalTasks = useDobyStore((s) => s.seasonalTasks);

  const showAlertBanner = useFeature("alertBanner");
  const showAdvisories = useFeature("advisories");
  const showAskDoby = useFeature("askDoby");

  const monthlyPI = calculateMonthlyPayment(mortgage.loanAmount, mortgage.interestRate, mortgage.termYears);
  const totalMonthly = calculateTotalMonthly(monthlyPI, mortgage.propertyTaxAnnual, mortgage.homeInsuranceAnnual, mortgage.pmi);

  const electricBills = utilities.filter((u) => u.type === "Electric").sort((a, b) => b.date.localeCompare(a.date));
  const latestEnergy = electricBills.length > 0 ? `${electricBills[0].amount} kWh` : "—";

  const overdueServices = systems.filter((s) => s.nextServiceDate && daysUntil(s.nextServiceDate) < 0).length;
  const openTasks = overdueServices;

  // Seasonal advisory
  const month = new Date().getMonth();
  let seasonalNote: { label: string; title: string; description: string } | null = null;
  if (month >= 2 && month <= 4) {
    seasonalNote = {
      label: "Seasonal",
      title: "Spring maintenance window",
      description: "Gutter cleaning, exterior inspection, and AC pre-season check before May.",
    };
  } else if (month >= 5 && month <= 7) {
    seasonalNote = {
      label: "Seasonal",
      title: "Summer maintenance window",
      description: "Check irrigation, trim trees, inspect deck/patio, and service dryer vent.",
    };
  } else if (month >= 8 && month <= 10) {
    seasonalNote = {
      label: "Seasonal",
      title: "Fall maintenance window",
      description: "Furnace service, gutter cleaning, weatherization, and drain outdoor faucets.",
    };
  } else {
    seasonalNote = {
      label: "Seasonal",
      title: "Winter maintenance window",
      description: "Check for ice dams, inspect insulation, test backup generator, and plan spring projects.",
    };
  }

  return (
    <div>
      {showAlertBanner && <AlertBanner />}

      {/* ── Header ── */}
      <div className="mb-12 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#fafafa]">
            {property.address || "DOBY"}
          </h1>
          <p className="mt-1 text-xs tracking-wide text-[#3f3f46]">
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
              <p className="text-[10px] uppercase tracking-widest text-[#27272a]">{m.label}</p>
              <p className={`mt-0.5 text-base font-semibold ${m.val === "—" ? "text-[#1e1e21]" : "text-[#71717a]"}`}>
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
            <h2 className="text-sm font-semibold tracking-tight text-[#a1a1aa]">Systems</h2>
            <span className="rounded bg-[#111113] px-[7px] py-[2px] text-[11px] text-[#3f3f46]">
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
            <h2 className="text-sm font-semibold tracking-tight text-[#a1a1aa]">Rooms</h2>
            <span className="rounded bg-[#111113] px-[7px] py-[2px] text-[11px] text-[#3f3f46]">
              {rooms.length}
            </span>
          </div>
          <RoomFormDialog />
        </div>
        {rooms.length === 0 ? (
          <p className="py-8 text-[13px] text-[#3f3f46]">No rooms configured. Add your first room to get started.</p>
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
        <div className="mb-12 flex items-start gap-3.5 rounded-[10px] border border-[#18181b] bg-[#0d0d0f] px-5 py-4">
          <span className="mt-px shrink-0 rounded bg-[#141416] px-2 py-[3px] text-[10px] uppercase tracking-wider text-[#52525b]">
            {seasonalNote.label}
          </span>
          <div>
            <p className="text-[13px] font-[450] text-[#71717a]">{seasonalNote.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-[#3f3f46]">{seasonalNote.description}</p>
          </div>
        </div>
      )}

      {/* ── Below-fold panels (feature-flagged) ── */}
      {(showAdvisories || showAskDoby) && (
        <div className="space-y-6">
          {showAdvisories && <AdvisoriesPanel />}
          {showAskDoby && <AskDoby />}
        </div>
      )}
    </div>
  );
}
