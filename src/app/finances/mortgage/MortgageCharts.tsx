"use client";

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

const fmt = (v: number) => "$" + Math.round(v).toLocaleString();
const fmtK = (v: number) => "$" + (v / 1000).toFixed(0) + "k";

const CHART_INTEREST = "var(--color-oxblood)";
const CHART_PRINCIPAL = "var(--color-azure)";

interface BreakdownRow {
  year: number;
  interest: number;
  principal: number;
  pctInterest: number;
  pctPrincipal: number;
  total: number;
}

interface BalanceRow {
  month: number;
  year: number;
  standard: number;
  accelerated: number;
}

interface InterestRow {
  month: number;
  year: number;
  standard: number;
  accelerated: number;
}

interface Props {
  breakdownData: BreakdownRow[];
  chartData: BalanceRow[];
  interestData: InterestRow[];
  crossoverYear: number | null;
  firstPctInterest: number;
  firstPayment: { interest: number; principal: number };
  interestSaved: number;
  extraEndsEarly: boolean;
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

export default function MortgageCharts({
  breakdownData, chartData, interestData,
  crossoverYear, firstPctInterest, firstPayment,
  interestSaved, extraEndsEarly,
}: Props) {
  return (
    <>
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
            <Bar dataKey="interest" stackId="pmt" name="Interest" fill={CHART_INTEREST} fillOpacity={0.7} />
            <Bar dataKey="principal" stackId="pmt" name="Principal" fill={CHART_PRINCIPAL} fillOpacity={0.85} />
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
                <stop offset="5%" stopColor={CHART_INTEREST} stopOpacity={0.15} />
                <stop offset="95%" stopColor={CHART_INTEREST} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_PRINCIPAL} stopOpacity={0.2} />
                <stop offset="95%" stopColor={CHART_PRINCIPAL} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="year" tickFormatter={(v) => `${Math.round(v)}y`} tick={{ fontSize: 10, fill: "var(--d-chart-tick)" }} stroke="var(--d-chart-grid)" />
            <YAxis tickFormatter={fmtK} tick={{ fontSize: 10, fill: "var(--d-chart-tick)" }} stroke="var(--d-chart-grid)" width={50} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="standard" name="Standard" stroke={CHART_INTEREST} strokeWidth={2} fill="url(#stdGrad)" dot={false} />
            <Area type="monotone" dataKey="accelerated" name="Accelerated" stroke={CHART_PRINCIPAL} strokeWidth={2} fill="url(#accGrad)" dot={false} />
            {extraEndsEarly && (
              <ReferenceLine x={chartData.find(d => d.accelerated === 0)?.year} stroke={CHART_PRINCIPAL} strokeDasharray="4 4" strokeWidth={1} />
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
                <stop offset="5%" stopColor={CHART_INTEREST} stopOpacity={0.1} />
                <stop offset="95%" stopColor={CHART_INTEREST} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="intAcc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_PRINCIPAL} stopOpacity={0.15} />
                <stop offset="95%" stopColor={CHART_PRINCIPAL} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="year" tickFormatter={(v) => `${Math.round(v)}y`} tick={{ fontSize: 10, fill: "var(--d-chart-tick)" }} stroke="var(--d-chart-grid)" />
            <YAxis tickFormatter={fmtK} tick={{ fontSize: 10, fill: "var(--d-chart-tick)" }} stroke="var(--d-chart-grid)" width={50} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="standard" name="Standard Interest" stroke={CHART_INTEREST} strokeWidth={2} fill="url(#intStd)" dot={false} />
            <Area type="monotone" dataKey="accelerated" name="Accelerated Interest" stroke={CHART_PRINCIPAL} strokeWidth={2} fill="url(#intAcc)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
        <p className="mt-3 text-center text-[11px] text-text-tertiary">
          The gap between curves = <span className="font-semibold text-azure">{fmt(interestSaved)}</span> in interest you keep
        </p>
      </div>
    </>
  );
}
