"use client";

import { useMemo } from "react";
import { useDobyStore } from "@/store";
import { useShallow } from "zustand/react/shallow";
import {
  calculateMonthlyPayment,
  calculateTotalMonthly,
  calculateHomeValue,
  calculateEquity,
  generateAmortizationSchedule,
} from "@/lib/mortgage";
import { monthsSinceStart } from "@/lib/dates";
import { formatCurrency } from "@/lib/formatters";
import StatBox from "@/components/shared/StatBox";

export default function FinancesOverview() {
  const { property, mortgage, appreciation, expenses } = useDobyStore(useShallow((s) => ({
    property: s.property, mortgage: s.mortgage,
    appreciation: s.appreciation, expenses: s.expenses,
  })));

  const { totalMonthly, months, schedule, equity, currentValue, totalExpenses } = useMemo(() => {
    const monthlyPI = calculateMonthlyPayment(mortgage.loanAmount, mortgage.interestRate, mortgage.termYears);
    const _totalMonthly = calculateTotalMonthly(monthlyPI, mortgage.propertyTaxAnnual, mortgage.homeInsuranceAnnual, mortgage.pmi);
    const _months = monthsSinceStart(mortgage.startDate);
    const _schedule = generateAmortizationSchedule(mortgage.loanAmount, mortgage.interestRate, mortgage.termYears);
    return {
      totalMonthly: _totalMonthly,
      months: _months,
      schedule: _schedule,
      equity: calculateEquity(property.purchasePrice, mortgage.loanAmount, _schedule, _months),
      currentValue: calculateHomeValue(property.purchasePrice, appreciation.annualRate, _months / 12),
      totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
    };
  }, [mortgage, property, appreciation, expenses]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        <StatBox label="Home Value" value={formatCurrency(currentValue)} variant="nominal" />
        <StatBox label="Equity" value={formatCurrency(equity)} />
        <StatBox label="Monthly Payment" value={formatCurrency(totalMonthly)} />
        <StatBox label="Loan Balance" value={formatCurrency(months > 0 && schedule.length > 0 ? schedule[Math.min(months - 1, schedule.length - 1)].balance : mortgage.loanAmount)} />
        <StatBox label="Total Expenses" value={formatCurrency(totalExpenses)} />
        <StatBox label="Appreciation Rate" value={`${appreciation.annualRate}%`} />
      </div>
    </div>
  );
}
