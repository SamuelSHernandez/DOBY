"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useDobyStore } from "@/store";
import { calculateMonthlyPayment, generateAmortizationSchedule } from "@/lib/mortgage";
import BackButton from "@/components/shared/BackButton";

const MortgageCharts = dynamic(() => import("./MortgageCharts"), {
  loading: () => (
    <div className="mb-6 border border-border bg-surface p-6 text-[11px] text-text-tertiary">
      Loading charts…
    </div>
  ),
});

const fmt = (v: number) => "$" + Math.round(v).toLocaleString();

const FALLBACK_LOAN_AMOUNT = 310000;
const FALLBACK_RATE = 6.5;
const DEFAULT_EXTRA_PAYMENT = 300;
const LOAN_TERM_YEARS = 30;

const LOAN_MIN = 100000;
const LOAN_MAX = 650000;
const LOAN_STEP = 5000;
const RATE_MIN = 3;
const RATE_MAX = 9;
const RATE_STEP = 0.125;
const EXTRA_MIN = 0;
const EXTRA_MAX = 2000;
const EXTRA_STEP = 25;

function amortize(principal: number, annualRate: number, years: number, extraMonthly = 0) {
  const schedule = generateAmortizationSchedule(principal, annualRate, years, extraMonthly);
  const basePayment = calculateMonthlyPayment(principal, annualRate, years);
  const last = schedule[schedule.length - 1];
  return {
    schedule,
    basePayment,
    totalInterest: last?.totalInterest ?? 0,
    totalPaid: schedule.reduce((sum, r) => sum + r.payment, 0),
    months: schedule.length,
  };
}

function Slider({ label, value, onChange, min, max, step, format }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; format: (v: number) => string;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  function startEditing() {
    setEditValue(String(value));
    setEditing(true);
  }

  function commitEdit() {
    const parsed = parseFloat(editValue.replace(/[^0-9.]/g, ""));
    if (!isNaN(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed));
      onChange(clamped);
    }
    setEditing(false);
  }

  return (
    <div className="mb-5">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">{label}</span>
        {editing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => e.key === "Enter" && commitEdit()}
            autoFocus
            className="w-32 border border-azure bg-carbon px-2 py-0.5 text-right text-sm font-semibold text-text-primary outline-none"
          />
        ) : (
          <button
            onClick={startEditing}
            className="text-sm font-semibold text-text-primary hover:text-azure"
            title="Click to type exact value"
          >
            {format(value)}
          </button>
        )}
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full accent-azure"
      />
    </div>
  );
}

function Stat({ label, value, sub, highlight }: {
  label: string; value: string; sub?: string; highlight?: boolean;
}) {
  return (
    <div className={`p-4 ${highlight ? "border border-azure bg-azure-dim" : "border border-border bg-surface"}`}>
      <div className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">{label}</div>
      <div className={`mt-1.5 text-xl font-bold ${highlight ? "text-azure" : "text-text-primary"}`}>{value}</div>
      {sub && <div className="mt-1 text-[11px] text-text-tertiary">{sub}</div>}
    </div>
  );
}

export default function MortgagePage() {
  const router = useRouter();
  const mortgage = useDobyStore((s) => s.mortgage);

  const [loanAmount, setLoanAmount] = useState(mortgage.loanAmount || FALLBACK_LOAN_AMOUNT);
  const [rate, setRate] = useState(mortgage.interestRate || FALLBACK_RATE);
  const [extraPayment, setExtraPayment] = useState(DEFAULT_EXTRA_PAYMENT);

  const base = useMemo(() => amortize(loanAmount, rate, LOAN_TERM_YEARS, 0), [loanAmount, rate]);
  const extra = useMemo(() => amortize(loanAmount, rate, LOAN_TERM_YEARS, extraPayment), [loanAmount, rate, extraPayment]);

  const interestSaved = base.totalInterest - extra.totalInterest;
  const monthsSaved = base.months - extra.months;
  const yearsSaved = Math.floor(monthsSaved / 12);
  const mosSaved = monthsSaved % 12;

  const chartData = useMemo(() => {
    const maxLen = Math.max(base.schedule.length, extra.schedule.length);
    const data: { month: number; year: number; standard: number; accelerated: number }[] = [];
    for (let i = 0; i < maxLen; i += 3) {
      const b = base.schedule[i] || base.schedule[base.schedule.length - 1];
      const e = extra.schedule[Math.min(i, extra.schedule.length - 1)] || { balance: 0 };
      data.push({
        month: base.schedule[i]?.month || base.months,
        year: +((base.schedule[i]?.month || base.months) / 12).toFixed(1),
        standard: b.balance,
        accelerated: i < extra.schedule.length ? e.balance : 0,
      });
    }
    return data;
  }, [base, extra]);

  const interestData = useMemo(() => {
    const data: { month: number; year: number; standard: number; accelerated: number }[] = [];
    for (let i = 0; i < base.schedule.length; i += 3) {
      const b = base.schedule[i];
      const e = extra.schedule[Math.min(i, extra.schedule.length - 1)];
      data.push({
        month: b.month,
        year: +(b.month / 12).toFixed(1),
        standard: b.totalInterest,
        accelerated: i < extra.schedule.length ? e.totalInterest : extra.totalInterest,
      });
    }
    return data;
  }, [base, extra]);

  const breakdownData = useMemo(() => {
    const data: { year: number; interest: number; principal: number; pctInterest: number; pctPrincipal: number; total: number }[] = [];
    for (let yr = 1; yr <= 30; yr++) {
      const idx = Math.min(yr * 12 - 1, extra.schedule.length - 1);
      if (idx < 0) break;
      const e = extra.schedule[idx];
      if (!e) break;
      const pctInterest = (e.interest / (e.interest + e.principal)) * 100;
      data.push({
        year: yr,
        interest: +e.interest.toFixed(2),
        principal: +e.principal.toFixed(2),
        pctInterest: +pctInterest.toFixed(1),
        pctPrincipal: +(100 - pctInterest).toFixed(1),
        total: +(e.interest + e.principal).toFixed(2),
      });
    }
    return data;
  }, [extra]);

  const crossoverYear = useMemo(() => {
    const found = extra.schedule.find((s) => s.principal > s.interest);
    return found ? Math.ceil(found.month / 12) : null;
  }, [extra]);

  const firstPayment = extra.schedule[0] || { interest: 0, principal: 0 };
  const firstPctInterest = +((firstPayment.interest / (firstPayment.interest + firstPayment.principal)) * 100).toFixed(0);

  return (
    <div className="mx-auto max-w-3xl">
      <BackButton href="/finances" label="Back to Finances" />

      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Mortgage Acceleration</p>
        <h1 className="mt-1 text-xl font-bold text-text-primary">Mortgage Acceleration Calculator</h1>
        <p className="mt-2 text-xs text-text-tertiary leading-relaxed">
          See how extra principal payments shorten your loan and save on interest.
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 border border-border bg-surface p-6">
        <Slider label="Loan Amount" value={loanAmount} onChange={setLoanAmount} min={LOAN_MIN} max={LOAN_MAX} step={LOAN_STEP} format={fmt} />
        <Slider label="Interest Rate" value={rate} onChange={setRate} min={RATE_MIN} max={RATE_MAX} step={RATE_STEP} format={(v) => v.toFixed(3) + "%"} />
        <Slider label="Extra Monthly Payment" value={extraPayment} onChange={setExtraPayment} min={EXTRA_MIN} max={EXTRA_MAX} step={EXTRA_STEP} format={fmt} />
        <div className="mt-3 border border-azure/20 bg-azure-dim px-3 py-2 text-[11px] text-azure">
          Base bi-weekly &asymp; {fmt(base.basePayment / 2)} &rarr; with extra: {fmt(base.basePayment / 2 + extraPayment / 2)} per paycheck
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <Stat
          label="Interest Saved" value={fmt(interestSaved)}
          sub={`${((interestSaved / base.totalInterest) * 100).toFixed(1)}% less interest`}
          highlight
        />
        <Stat
          label="Time Saved" value={`${yearsSaved}y ${mosSaved}m`}
          sub={`Paid off in ${Math.floor(extra.months / 12)}y ${extra.months % 12}m`}
          highlight
        />
        <Stat label="Total Interest (Standard)" value={fmt(base.totalInterest)} sub={`${fmt(base.totalPaid)} total paid`} />
        <Stat label="Total Interest (Accelerated)" value={fmt(extra.totalInterest)} sub={`${fmt(extra.totalPaid)} total paid`} />
      </div>

      <MortgageCharts
        breakdownData={breakdownData}
        chartData={chartData}
        interestData={interestData}
        crossoverYear={crossoverYear}
        firstPctInterest={firstPctInterest}
        firstPayment={firstPayment}
        interestSaved={interestSaved}
        extraEndsEarly={extra.months < base.months}
      />

      {/* Equity Milestones */}
      <div className="mb-6 border border-border bg-surface p-6">
        <p className="mb-4 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Equity Milestones</p>
        {[25, 50, 75, 100].map((pct) => {
          const target = loanAmount * (1 - pct / 100);
          const stdMonth = base.schedule.find((s) => s.balance <= target)?.month || base.months;
          const accMonth = extra.schedule.find((s) => s.balance <= target)?.month || extra.months;
          const diff = stdMonth - accMonth;
          return (
            <div key={pct} className={`flex items-center py-3 ${pct < 100 ? "border-b border-border" : ""}`}>
              {/* Donut */}
              <div className="mr-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(var(--color-azure) ${pct * 3.6}deg, var(--d-border) 0deg)` }}>
                <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-surface text-[10px] font-semibold text-text-primary">
                  {pct}%
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary">{pct}% equity</p>
                <p className="text-[11px] text-text-tertiary">
                  Standard: {Math.floor(stdMonth / 12)}y {stdMonth % 12}m &rarr; Accelerated: {Math.floor(accMonth / 12)}y {accMonth % 12}m
                </p>
              </div>
              <span className="border border-azure/20 bg-azure-dim px-2.5 py-1 text-xs font-semibold text-azure">
                &minus;{Math.floor(diff / 12)}y {diff % 12}m
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-center text-[10px] text-text-tertiary">
        30-year fixed &middot; No prepayment penalties
      </p>
    </div>
  );
}
