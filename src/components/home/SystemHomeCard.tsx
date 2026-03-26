"use client";

import { useRef, useEffect, useState } from "react";
import type { HomeSystem } from "@/store/types";
import { yearsFractional } from "@/lib/dates";
import { formatDate } from "@/lib/dates";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  system: HomeSystem;
  expanded: boolean;
  onToggle: () => void;
}

function LifeBar({ age, lifespan }: { age: number; lifespan: number }) {
  const usedPct = Math.min((age / lifespan) * 100, 100);
  const remainingPct = 100 - usedPct;
  const hue = 90 + remainingPct * 0.5;
  const sat = 20 + remainingPct * 0.3;
  const color = `hsl(${Math.min(hue, 140)}, ${sat}%, 40%)`;

  return (
    <div className="h-[3px] w-full overflow-hidden rounded-sm bg-[#1a1a1d]">
      <div
        className="h-full rounded-sm transition-all duration-500"
        style={{ width: `${remainingPct}%`, background: color }}
      />
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-widest text-[#3f3f46]">
        {label}
      </span>
      <span className="inline-block rounded-[3px] bg-[rgba(255,255,255,0.03)] px-2 py-1 font-mono text-[12px] text-[#a1a1aa]">
        {value || "—"}
      </span>
    </div>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  hvac: "#3083DC",
  electrical: "#FE9000",
  plumbing: "#058C42",
  security: "#95190C",
  network: "#8B5CF6",
  appliances: "#71717a",
  lighting: "#EAB308",
};

export default function SystemHomeCard({ system, expanded, onToggle }: Props) {
  const age = system.installDate ? yearsFractional(system.installDate) : 0;
  const lifespan = system.estimatedLifeYears || 15;
  const remaining = Math.max(0, Math.round(100 - Math.min((age / lifespan) * 100, 100)));

  const detail = system.notes || system.brand || system.condition || "—";
  const nextService = system.nextServiceDate ? `Service scheduled` : null;

  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [expanded, system]);

  const accentColor = CATEGORY_COLORS[system.category] || "#3f3f46";
  const isHvac = system.category === "hvac";
  const hasNetworkDetails = system.category === "network" && (system.provider || system.monthlyPayment || system.accountNumber);
  const hasApplianceDetails = system.category === "appliances" && (system.brand || system.modelNumber || system.serialNumber);

  return (
    <div
      className={`flex cursor-pointer flex-col rounded-[10px] border transition-all duration-300 ${
        expanded
          ? "col-span-full border-[rgba(255,255,255,0.12)] bg-[#111316]"
          : "border-[#18181b] bg-[#0d0d0f] hover:-translate-y-px hover:border-[#27272a] hover:bg-[#131316]"
      }`}
      onClick={onToggle}
    >
      {/* ── Collapsed header (always visible) ── */}
      <div className="flex flex-col gap-3 px-[18px] py-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] font-medium text-[#d4d4d8]">{system.name}</p>
            <p className="mt-0.5 text-[11px] text-[#3f3f46]">
              {detail.length > 24 ? detail.slice(0, 24) + "…" : detail}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-[11px] text-[#27272a]">{remaining}%</span>
            <span
              className="text-[10px] text-[#3f3f46] transition-transform duration-300"
              style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              ▼
            </span>
          </div>
        </div>

        <LifeBar age={age} lifespan={lifespan} />

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#27272a]">
            {Math.round(age)} yr of ~{lifespan} yr est.
          </span>
          {nextService && (
            <span className="rounded-[3px] bg-[#141416] px-[7px] py-[2px] text-[10px] text-[#52525b]">
              {nextService}
            </span>
          )}
        </div>
      </div>

      {/* ── Expandable detail section ── */}
      <div
        className="overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          maxHeight: expanded ? `${contentHeight}px` : "0px",
          opacity: expanded ? 1 : 0,
        }}
      >
        <div ref={contentRef} onClick={(e) => e.stopPropagation()}>
          {/* Divider */}
          <div className="mx-[18px] border-t border-[rgba(255,255,255,0.06)]" />

          {/* Detail fields – 2-col grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-[18px] py-5 sm:grid-cols-3">
            <DetailField label="Install Date" value={formatDate(system.installDate)} />
            <DetailField label="Last Service" value={formatDate(system.lastServiceDate)} />
            <DetailField label="Next Service" value={formatDate(system.nextServiceDate)} />
            <DetailField label="Warranty Expires" value={formatDate(system.warrantyExpiration)} />
            <DetailField label="Lifespan (Years)" value={system.estimatedLifeYears ? `${system.estimatedLifeYears} yr` : "—"} />
            <DetailField label="Replace Cost" value={system.estimatedReplaceCost ? formatCurrency(system.estimatedReplaceCost) : "—"} />
          </div>

          {/* HVAC-specific details */}
          {isHvac && (
            <div className="px-[18px] pb-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-px flex-1 bg-[rgba(255,255,255,0.04)]" />
                <span
                  className="text-[10px] uppercase tracking-widest"
                  style={{ color: accentColor }}
                >
                  HVAC Details
                </span>
                <div className="h-px flex-1 bg-[rgba(255,255,255,0.04)]" />
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                <DetailField label="Filter Size" value={system.filterSize || "—"} />
                <DetailField label="Filter Change (Months)" value={system.filterChangeIntervalMonths ? `${system.filterChangeIntervalMonths} mo` : "—"} />
              </div>
            </div>
          )}

          {/* Network-specific details */}
          {hasNetworkDetails && (
            <div className="px-[18px] pb-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-px flex-1 bg-[rgba(255,255,255,0.04)]" />
                <span
                  className="text-[10px] uppercase tracking-widest"
                  style={{ color: accentColor }}
                >
                  Network Details
                </span>
                <div className="h-px flex-1 bg-[rgba(255,255,255,0.04)]" />
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                {system.provider && <DetailField label="Provider" value={system.provider} />}
                {system.monthlyPayment != null && <DetailField label="Monthly Payment" value={formatCurrency(system.monthlyPayment)} />}
                {system.accountNumber && <DetailField label="Account Number" value={system.accountNumber} />}
              </div>
            </div>
          )}

          {/* Appliance-specific details */}
          {hasApplianceDetails && (
            <div className="px-[18px] pb-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-px flex-1 bg-[rgba(255,255,255,0.04)]" />
                <span
                  className="text-[10px] uppercase tracking-widest"
                  style={{ color: accentColor }}
                >
                  Appliance Details
                </span>
                <div className="h-px flex-1 bg-[rgba(255,255,255,0.04)]" />
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                {system.brand && <DetailField label="Brand" value={system.brand} />}
                {system.modelNumber && <DetailField label="Model Number" value={system.modelNumber} />}
                {system.serialNumber && <DetailField label="Serial Number" value={system.serialNumber} />}
              </div>
            </div>
          )}

          {/* Notes – full width */}
          {system.notes && (
            <div className="px-[18px] pb-5">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-[#3f3f46]">
                  Notes
                </span>
                <p className="rounded-[3px] bg-[rgba(255,255,255,0.03)] px-2 py-1.5 font-mono text-[12px] leading-relaxed text-[#a1a1aa]">
                  {system.notes}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
