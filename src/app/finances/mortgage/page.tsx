"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { useDobyStore } from "@/store";
import { calculateMonthlyPayment, generateAmortizationSchedule } from "@/lib/mortgage";
import BackButton from "@/components/shared/BackButton";

const fmt = (v: number) => "$" + Math.round(v).toLocaleString();
const fmtK = (v: number) => "$" + (v / 1000).toFixed(0) + "k";

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

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string; payload?: { month: number } }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as { month: number } | undefined;
  if (!d) return null;
  const yrs = Math.floor(d.month / 12);
  const mos = d.month % 12;
  return (
    <div className="border border-border bg-panel p-2.5 text-[11px]">
      <div className="mb-1 font-bold text-text-primary">Year {yrs}, Month {mos}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }} className="mt-0.5">
          {p.name}: {fmt(p.value)}
        </div>
      ))}
    </div>
  );
}

export default function MortgagePage() {
  const router = useRouter();
  const mortgage = useDobyStore((s) => s.mortgage);

  const [loanAmount, setLoanAmount] = useState(mortgage.loanAmount || 310000);
  const [rate, setRate] = useState(mortgage.interestRate || 6.5);
  const [extraPayment, setExtraPayment] = useState(300);

  const base = useMemo(() => amortize(loanAmount, rate, 30, 0), [loanAmount, rate]);
  const extra = useMemo(() => amortize(loanAmount, rate, 30, extraPayment), [loanAmount, rate, extraPayment]);

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
        <Slider label="Loan Amount" value={loanAmount} onChange={setLoanAmount} min={100000} max={650000} step={5000} format={fmt} />
        <Slider label="Interest Rate" value={rate} onChange={setRate} min={3} max={9} step={0.125} format={(v) => v.toFixed(3) + "%"} />
        <Slider label="Extra Monthly Payment" value={extraPayment} onChange={setExtraPayment} min={0} max={2000} step={25} format={fmt} />
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

      {/* Payment Breakdown */}
      <div className="mb-6 border border-border bg-surface p-6">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Where Each Payment Goes</span>
          <span className="border border-azure/20 bg-azure-dim px-2 py-0.5 text-[10px] text-azure">with extra payments</span>
        </div>
        <p className="mb-4 text-[11px] text-text-tertiary leading-relaxed">
          First payment: <span className="font-semibold text-oxblood">{firstPctInterest}% interest</span> ({fmt(firstPayment.interest)}) vs{" "}
          <span className="font-semibold text-azure">{100 - firstPctInterest}% principal</span> ({fmt(firstPayment.principal)})
          {crossoverYear && <span> &middot; Flips at <strong className="text-text-primary">year {crossoverYear}</strong></span>}
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={breakdownData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} stackOffset="expand" barCategoryGap="15%">
            <XAxis dataKey="year" tickFormatter={(v) => `${v}y`} tick={{ fontSize: 10, fill: "var(--d-chart-tick)" }} stroke="var(--d-chart-grid)" />
            <YAxis tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 10, fill: "var(--d-chart-tick)" }} stroke="var(--d-chart-grid)" width={40} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                if (!d) return null;
                return (
                  <div className="border border-border bg-panel p-2.5 text-[11px]">
                    <div className="mb-1 font-bold text-text-primary">Year {label}</div>
                    <div className="text-oxblood">Interest: {fmt(d.interest)} ({d.pctInterest}%)</div>
                    <div className="text-azure">Principal: {fmt(d.principal)} ({d.pctPrincipal}%)</div>
                    <div className="mt-1 border-t border-border pt-1 text-text-tertiary">Payment: {fmt(d.total)}</div>
                  </div>
                );
              }}
            />
            <Bar dataKey="interest" stackId="pmt" name="Interest" fill="#95190C" fillOpacity={0.7} />
            <Bar dataKey="principal" stackId="pmt" name="Principal" fill="#3083DC" fillOpacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 flex items-center justify-center gap-5 text-[11px] text-text-tertiary">
          <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-3 bg-oxblood/70" /> Interest</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-3 bg-azure/85" /> Principal</span>
          {crossoverYear && <span>&uarr; Crossover: year {crossoverYear}</span>}
        </div>
      </div>

      {/* Balance Chart */}
      <div className="mb-6 border border-border bg-surface p-6">
        <p className="mb-4 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Remaining Balance Over Time</p>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="stdGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#95190C" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#95190C" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3083DC" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3083DC" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="year" tickFormatter={(v) => `${Math.round(v)}y`} tick={{ fontSize: 10, fill: "var(--d-chart-tick)" }} stroke="var(--d-chart-grid)" />
            <YAxis tickFormatter={fmtK} tick={{ fontSize: 10, fill: "var(--d-chart-tick)" }} stroke="var(--d-chart-grid)" width={50} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="standard" name="Standard" stroke="#95190C" strokeWidth={2} fill="url(#stdGrad)" dot={false} />
            <Area type="monotone" dataKey="accelerated" name="Accelerated" stroke="#3083DC" strokeWidth={2} fill="url(#accGrad)" dot={false} />
            {extra.months < base.months && (
              <ReferenceLine x={chartData.find(d => d.accelerated === 0)?.year} stroke="#3083DC" strokeDasharray="4 4" strokeWidth={1} />
            )}
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-3 flex items-center justify-center gap-5 text-[11px] text-text-tertiary">
          <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-3 bg-oxblood" /> Standard (30yr)</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-3 bg-azure" /> With Extra Payments</span>
        </div>
      </div>

      {/* Cumulative Interest Chart */}
      <div className="mb-6 border border-border bg-surface p-6">
        <p className="mb-4 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Cumulative Interest Paid</p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={interestData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="intStd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#95190C" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#95190C" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="intAcc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3083DC" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3083DC" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="year" tickFormatter={(v) => `${Math.round(v)}y`} tick={{ fontSize: 10, fill: "var(--d-chart-tick)" }} stroke="var(--d-chart-grid)" />
            <YAxis tickFormatter={fmtK} tick={{ fontSize: 10, fill: "var(--d-chart-tick)" }} stroke="var(--d-chart-grid)" width={50} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="standard" name="Standard Interest" stroke="#95190C" strokeWidth={2} fill="url(#intStd)" dot={false} />
            <Area type="monotone" dataKey="accelerated" name="Accelerated Interest" stroke="#3083DC" strokeWidth={2} fill="url(#intAcc)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
        <p className="mt-3 text-center text-[11px] text-text-tertiary">
          The gap between curves = <span className="font-semibold text-azure">{fmt(interestSaved)}</span> in interest you keep
        </p>
      </div>

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
              <div className="mr-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(#3083DC ${pct * 3.6}deg, var(--d-border) 0deg)` }}>
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
