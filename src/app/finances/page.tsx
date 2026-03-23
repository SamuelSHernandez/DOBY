"use client";

import { useDobyStore } from "@/store";
import { calculateMonthlyPayment, calculateTotalMonthly } from "@/lib/mortgage";
import { formatCurrency, formatSqFt } from "@/lib/formatters";
import PageHeader from "@/components/layout/PageHeader";
import StatBox from "@/components/shared/StatBox";
import CostBreakdown from "@/components/finances/CostBreakdown";
import RoomCostAttribution from "@/components/finances/RoomCostAttribution";

export default function FinancesPage() {
  const mortgage = useDobyStore((s) => s.mortgage);
  const rooms = useDobyStore((s) => s.rooms);
  const expenses = useDobyStore((s) => s.expenses);

  const monthlyPI = calculateMonthlyPayment(mortgage.loanAmount, mortgage.interestRate, mortgage.termYears);
  const totalMonthly = calculateTotalMonthly(monthlyPI, mortgage.propertyTaxAnnual, mortgage.homeInsuranceAnnual, mortgage.pmi);
  const annualProjection = totalMonthly * 12;

  // Highest cost room by sq ft share
  const roomData = rooms.map((r) => ({
    name: r.name,
    sqft: formatSqFt(r.widthFt, r.widthIn, r.heightFt, r.heightIn),
  }));
  const totalSqFt = roomData.reduce((sum, r) => sum + r.sqft, 0);
  const highestRoom = roomData.sort((a, b) => b.sqft - a.sqft)[0];
  const highestPct = highestRoom && totalSqFt > 0 ? Math.round((highestRoom.sqft / totalSqFt) * 100) : 0;

  return (
    <div>
      <PageHeader title="Finances" />

      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatBox label="Monthly Total" value={totalMonthly > 0 ? formatCurrency(totalMonthly) : "—"} />
        <StatBox label="Annual Projection" value={annualProjection > 0 ? formatCurrency(annualProjection) : "—"} />
        <StatBox
          label="Highest Cost Room"
          value={highestRoom ? highestRoom.name : "—"}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <CostBreakdown />
        <RoomCostAttribution />
      </div>
    </div>
  );
}
