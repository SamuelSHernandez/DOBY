"use client";

import { useRef, useEffect, useState } from "react";
import type { HomeSystem } from "@/store/types";
import { formatDate } from "@/lib/dates";
import { getSystemLifecyclePct } from "@/lib/system-health";
import { systemCategoryColors } from "@/store/defaults";
import { formatCurrency } from "@/lib/formatters";
import LifecycleBar from "@/components/shared/LifecycleBar";

interface Props {
  system: HomeSystem;
  expanded: boolean;
  onToggle: () => void;
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-widest text-text-tertiary">
        {label}
      </span>
      <span className="inline-block rounded-[3px] px-2 py-1 font-mono text-[12px] text-text-secondary" style={{ background: "var(--d-glass)" }}>
        {value || "—"}
      </span>
    </div>
  );
}

export default function SystemHomeCard({ system, expanded, onToggle }: Props) {
  const lifespan = system.estimatedLifeYears || 15;
  const usedPct = getSystemLifecyclePct(system.installDate, lifespan);
  const remaining = Math.max(0, Math.round(100 - usedPct));
  const age = usedPct * lifespan / 100;

  const detail = system.notes || system.brand || system.condition || "—";
  const nextService = system.nextServiceDate ? `Service scheduled` : null;

  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [expanded, system]);

  const accentColor = systemCategoryColors[system.category] || "var(--d-text-tertiary)";
  const isHvac = system.category === "hvac";
  const hasNetworkDetails = system.category === "network" && (system.provider || system.monthlyPayment || system.accountNumber);
  const hasApplianceDetails = system.category === "appliances" && (system.brand || system.modelNumber || system.serialNumber);

  return (
    <div
      className={`flex cursor-pointer flex-col rounded-[10px] border transition-all duration-300 ${
        expanded
          ? "col-span-full border-border-bright bg-surface"
          : "border-border bg-panel hover:-translate-y-px hover:border-border-bright hover:bg-surface-hover"
      }`}
      onClick={onToggle}
    >
      {/* ── Collapsed header (always visible) ── */}
      <div className="flex flex-col gap-3 px-[18px] py-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] font-medium text-text-primary">{system.name}</p>
            <p className="mt-0.5 text-[11px] text-text-tertiary">
              {detail.length > 24 ? detail.slice(0, 24) + "…" : detail}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-[11px] text-border-bright">{remaining}%</span>
            <span
              className="text-[10px] text-text-tertiary transition-transform duration-300"
              style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              ▼
            </span>
          </div>
        </div>

        <LifecycleBar percent={usedPct} variant="gradient" />

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-border-bright">
            {Math.round(age)} yr of ~{lifespan} yr est.
          </span>
          {nextService && (
            <span className="rounded-[3px] bg-surface-raised px-[7px] py-[2px] text-[10px] text-text-dim">
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
          <div className="mx-[18px] border-t border-border" />

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
                <div className="h-px flex-1 bg-border" />
                <span
                  className="text-[10px] uppercase tracking-widest"
                  style={{ color: accentColor }}
                >
                  HVAC Details
                </span>
                <div className="h-px flex-1 bg-border" />
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
                <div className="h-px flex-1 bg-border" />
                <span
                  className="text-[10px] uppercase tracking-widest"
                  style={{ color: accentColor }}
                >
                  Network Details
                </span>
                <div className="h-px flex-1 bg-border" />
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
                <div className="h-px flex-1 bg-border" />
                <span
                  className="text-[10px] uppercase tracking-widest"
                  style={{ color: accentColor }}
                >
                  Appliance Details
                </span>
                <div className="h-px flex-1 bg-border" />
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
                <span className="text-[10px] uppercase tracking-widest text-text-tertiary">
                  Notes
                </span>
                <p className="rounded-[3px] px-2 py-1.5 font-mono text-[12px] leading-relaxed text-text-secondary" style={{ background: "var(--d-glass)" }}>
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
