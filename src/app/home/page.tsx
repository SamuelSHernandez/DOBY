"use client";

import { useDobyStore } from "@/store";
import { calculateMonthlyPayment, calculateTotalMonthly } from "@/lib/mortgage";
import { yearsFractional, daysUntil } from "@/lib/dates";
import { formatCurrency } from "@/lib/formatters";
import StatBox from "@/components/shared/StatBox";
import AlertBanner from "@/components/home/AlertBanner";
import RoomCompactCard from "@/components/home/RoomCompactCard";
import UpcomingMaintenance from "@/components/home/UpcomingMaintenance";
import AdvisoriesPanel from "@/components/home/AdvisoriesPanel";
import AskDoby from "@/components/home/AskDoby";

export default function HomePage() {
  const rooms = useDobyStore((s) => s.rooms);
  const systems = useDobyStore((s) => s.systems);
  const mortgage = useDobyStore((s) => s.mortgage);
  const utilities = useDobyStore((s) => s.utilities);
  const seasonalTasks = useDobyStore((s) => s.seasonalTasks);

  // Monthly cost
  const monthlyPI = calculateMonthlyPayment(mortgage.loanAmount, mortgage.interestRate, mortgage.termYears);
  const totalMonthly = calculateTotalMonthly(monthlyPI, mortgage.propertyTaxAnnual, mortgage.homeInsuranceAnnual, mortgage.pmi);

  // Latest energy
  const electricBills = utilities.filter((u) => u.type === "Electric").sort((a, b) => b.date.localeCompare(a.date));
  const latestEnergy = electricBills.length > 0 ? `${electricBills[0].amount} kWh` : "—";

  // Open tasks count
  const overdueServices = systems.filter((s) => s.nextServiceDate && daysUntil(s.nextServiceDate) < 0).length;
  const incompleteSeasonal = Object.values(seasonalTasks).filter((v) => !v).length;
  const openTasks = overdueServices + incompleteSeasonal;

  // Systems health
  const nominalCount = systems.filter((s) => {
    if (!s.installDate || s.estimatedLifeYears <= 0) return true;
    const pct = (yearsFractional(s.installDate) / s.estimatedLifeYears) * 100;
    return pct <= 50;
  }).length;

  return (
    <div>
      <AlertBanner />

      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatBox
          label="Monthly Cost"
          value={totalMonthly > 0 ? formatCurrency(totalMonthly) : "—"}
          variant="default"
        />
        <StatBox
          label="Energy"
          value={latestEnergy}
          variant="nominal"
        />
        <StatBox
          label="Open Tasks"
          value={openTasks > 0 ? `${openTasks} tasks` : "0 tasks"}
          variant={overdueServices > 0 ? "caution" : "default"}
        />
        <StatBox
          label="Systems"
          value={systems.length > 0 ? `${nominalCount} / ${systems.length}` : "—"}
          variant={nominalCount === systems.length ? "nominal" : "caution"}
        />
      </div>

      {/* Rooms */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">Rooms</h2>
          <span className="border border-border px-1.5 py-0.5 text-[10px] text-text-tertiary">{rooms.length}</span>
        </div>
        {rooms.length === 0 ? (
          <p className="py-6 text-xs text-text-tertiary">No rooms configured. Add rooms from Settings to see them here.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomCompactCard key={room.id} room={room} systems={systems} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom two-column: Maintenance + Advisories */}
      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingMaintenance />
        <AdvisoriesPanel />
      </div>

      <AskDoby />
    </div>
  );
}
