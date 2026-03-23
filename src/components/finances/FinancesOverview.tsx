"use client";

import { useDobyStore } from "@/store";
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
  const property = useDobyStore((s) => s.property);
  const mortgage = useDobyStore((s) => s.mortgage);
  const appreciation = useDobyStore((s) => s.appreciation);
  const expenses = useDobyStore((s) => s.expenses);

  const monthlyPI = calculateMonthlyPayment(
    mortgage.loanAmount,
    mortgage.interestRate,
    mortgage.termYears
  );
  const totalMonthly = calculateTotalMonthly(
    monthlyPI,
    mortgage.propertyTaxAnnual,
    mortgage.homeInsuranceAnnual,
    mortgage.pmi
  );

  const months = monthsSinceStart(mortgage.startDate);
  const years = months / 12;
  const schedule = generateAmortizationSchedule(
    mortgage.loanAmount,
    mortgage.interestRate,
    mortgage.termYears
  );
  const equity = calculateEquity(property.purchasePrice, mortgage.loanAmount, schedule, months);
  const currentValue = calculateHomeValue(
    property.purchasePrice,
    appreciation.annualRate,
    years
  );

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

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
