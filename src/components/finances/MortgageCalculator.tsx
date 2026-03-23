"use client";

import { useState } from "react";
import { useDobyStore } from "@/store";
import {
  calculateMonthlyPayment,
  calculateTotalMonthly,
  generateAmortizationSchedule,
} from "@/lib/mortgage";
import { formatCurrencyExact, formatCurrency } from "@/lib/formatters";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function MortgageCalculator() {
  const mortgage = useDobyStore((s) => s.mortgage);
  const updateMortgage = useDobyStore((s) => s.updateMortgage);
  const [showAllRows, setShowAllRows] = useState(false);

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
  const schedule = generateAmortizationSchedule(
    mortgage.loanAmount,
    mortgage.interestRate,
    mortgage.termYears
  );

  // Show yearly summary (last month of each year)
  const yearlyRows = schedule.filter(
    (row) => row.month % 12 === 0 || row.month === schedule.length
  );
  const keyYears = yearlyRows.filter((row) =>
    [12, 60, 120, 180, 240, 300, 360].includes(row.month)
  );
  const displayRows = showAllRows ? yearlyRows : keyYears;

  function handleChange(field: string, value: string) {
    const num = Number(value);
    if (!isNaN(num)) {
      updateMortgage({ [field]: num });
    } else {
      updateMortgage({ [field]: value });
    }
    toast.success("Saved");
  }

  const fields = [
    { key: "loanAmount", label: "Loan Amount", type: "number" },
    { key: "downPayment", label: "Down Payment", type: "number" },
    { key: "interestRate", label: "Interest Rate (%)", type: "number" },
    { key: "termYears", label: "Term (Years)", type: "number" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "propertyTaxAnnual", label: "Property Tax (Annual)", type: "number" },
    { key: "homeInsuranceAnnual", label: "Home Insurance (Annual)", type: "number" },
    { key: "pmi", label: "PMI (Monthly)", type: "number" },
    { key: "loanProgram", label: "Loan Program", type: "text" },
  ] as const;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((f) => (
          <div key={f.key}>
            <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">{f.label}</Label>
            <Input
              type={f.type}
              defaultValue={mortgage[f.key as keyof typeof mortgage] ?? ""}
              onBlur={(e) => handleChange(f.key, e.target.value)}
              step={f.key === "interestRate" ? "0.125" : undefined}
              className="mt-1 border-border bg-surface text-text-primary"
            />
          </div>
        ))}
      </div>

      {monthlyPI > 0 && (
        <div className="mt-6 border border-border bg-surface p-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Monthly Breakdown</p>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Principal & Interest</span>
              <span className="font-semibold text-text-primary">{formatCurrencyExact(monthlyPI)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Property Tax</span>
              <span className="text-text-primary">{formatCurrencyExact(mortgage.propertyTaxAnnual / 12)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Insurance</span>
              <span className="text-text-primary">{formatCurrencyExact(mortgage.homeInsuranceAnnual / 12)}</span>
            </div>
            {mortgage.pmi > 0 && (
              <div className="flex justify-between">
                <span className="text-text-secondary">PMI</span>
                <span className="text-text-primary">{formatCurrencyExact(mortgage.pmi)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-1">
              <span className="font-semibold text-text-primary">Total</span>
              <span className="font-bold text-azure">{formatCurrencyExact(totalMonthly)}</span>
            </div>
          </div>
        </div>
      )}

      {displayRows.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
              Amortization Schedule
            </p>
            <Button
              variant="outline"
              size="xs"
              onClick={() => setShowAllRows((v) => !v)}
              className="border-border text-text-tertiary"
            >
              {showAllRows ? "Key Years" : "All Years"}
            </Button>
          </div>
          <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
            <table className="w-full min-w-[500px] text-[11px]">
              <thead>
                <tr className="border-b border-border text-left text-[10px] uppercase tracking-wider text-text-tertiary">
                  <th className="py-2 pr-4">Year</th>
                  <th className="py-2 pr-4">Principal</th>
                  <th className="py-2 pr-4">Interest</th>
                  <th className="py-2 pr-4">Balance</th>
                  <th className="py-2">Total Interest</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row) => (
                  <tr key={row.month} className="border-b border-border/50">
                    <td className="py-1.5 pr-4 text-text-primary">{row.year}</td>
                    <td className="py-1.5 pr-4 text-text-secondary">{formatCurrency(row.totalPrincipal)}</td>
                    <td className="py-1.5 pr-4 text-text-secondary">{formatCurrency(row.totalInterest)}</td>
                    <td className="py-1.5 pr-4 text-text-primary">{formatCurrency(row.balance)}</td>
                    <td className="py-1.5 text-text-tertiary">{formatCurrency(row.totalInterest)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
