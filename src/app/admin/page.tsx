"use client";

import { useEffect, useState } from "react";
import { useDobyStore } from "@/store";
import PageHeader from "@/components/layout/PageHeader";
import { toast } from "sonner";
import type { FeatureFlags, Theme } from "@/store/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface FeatureToggle {
  key: keyof FeatureFlags;
  label: string;
  description: string;
  group: string;
}

const features: FeatureToggle[] = [
  // Home
  { key: "alertBanner", label: "Alert Banner", description: "Critical system alerts at top of Home dashboard", group: "Home" },
  { key: "advisories", label: "Advisories", description: "System lifecycle warnings and seasonal advisories", group: "Home" },

  // Finances
  { key: "expenseTracker", label: "Expense Tracker", description: "Log and categorize home expenses", group: "Finances" },
  { key: "insurancePanel", label: "Insurance Panel", description: "Insurance policy details and agent info", group: "Finances" },
  { key: "mortgageCalculator", label: "Mortgage Calculator", description: "Mortgage acceleration calculator with charts", group: "Finances" },
  { key: "costBreakdown", label: "Cost Breakdown", description: "Horizontal bar chart of cost categories", group: "Finances" },
  { key: "roomCostAttribution", label: "Room Cost Attribution", description: "Cost distribution by room based on sq ft", group: "Finances" },

  // Upkeep
  { key: "seasonalChecklist", label: "Seasonal Checklist", description: "Spring/Summer/Fall/Winter maintenance checklists", group: "Upkeep" },
  { key: "projectTracker", label: "Project Tracker", description: "Renovation and improvement project tracking", group: "Upkeep" },
  { key: "utilityTracker", label: "Utility Tracker", description: "Monthly utility bill logging with trend chart", group: "Upkeep" },

  // Reference
  { key: "emergencyPanel", label: "Emergency Panel", description: "Shutoff locations, security codes, wifi password", group: "Reference" },
  { key: "contractorDirectory", label: "Contractor Directory", description: "Contractor contacts with ratings", group: "Reference" },
  { key: "documentIndex", label: "Document Index", description: "Important document tracking and locations", group: "Reference" },

  // Room Detail
  { key: "wishlist", label: "Wishlist", description: "Room wishlist with priority levels", group: "Room Detail" },
  { key: "materials", label: "Materials & Finishes", description: "Paint colors, flooring, tile per room", group: "Room Detail" },

];

const groups = [...new Set(features.map((f) => f.group))];

export default function AdminPage() {
  const flags = useDobyStore((s) => s.featureFlags);
  const updateFlags = useDobyStore((s) => s.updateFeatureFlags);
  const theme = useDobyStore((s) => s.theme);
  const setTheme = useDobyStore((s) => s.setTheme);
  const resetStore = useDobyStore((s) => s.resetStore);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    toast.success("Signed out");
  }

  function toggle(key: keyof FeatureFlags) {
    updateFlags({ [key]: !flags[key] });
    toast.success(`${key} ${flags[key] ? "disabled" : "enabled"}`);
  }

  function enableAll() {
    const allOn: Partial<FeatureFlags> = {};
    for (const f of features) allOn[f.key] = true;
    updateFlags(allOn);
    toast.success("All features enabled");
  }

  function disableAll() {
    const allOff: Partial<FeatureFlags> = {};
    for (const f of features) allOff[f.key] = false;
    updateFlags(allOff);
    toast.success("All features disabled");
  }

  const enabledCount = features.filter((f) => flags[f.key]).length;

  return (
    <div>
      <PageHeader
        title="Admin"
        subtitle={`${enabledCount} / ${features.length} features enabled`}
      />

      {/* ── Account ── */}
      {isSupabaseConfigured && (
        <div className="mb-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-primary">Account</h2>
          <div className="flex items-center justify-between border border-border bg-surface px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-text-primary truncate">{email ?? "—"}</p>
              <p className="text-[11px] text-text-tertiary">Synced to Supabase</p>
            </div>
            <button
              onClick={signOut}
              className="border border-border px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-text-secondary hover:border-oxblood hover:text-oxblood"
            >
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* ── Theme ── */}
      <div className="mb-8">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-primary">Theme</h2>
        <div className="flex gap-2">
          {(["dark", "light"] as Theme[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTheme(t); toast.success(`${t} mode`); }}
              className={`border px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider transition-colors ${
                theme === t
                  ? "border-azure bg-azure-dim text-azure"
                  : "border-border text-text-secondary hover:border-border-bright"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => {
            updateFlags({
              advisories: true, alertBanner: true, seasonalChecklist: true,
              projectTracker: true, utilityTracker: true, expenseTracker: true,
              insurancePanel: false, contractorDirectory: true, documentIndex: true,
              emergencyPanel: true, wishlist: true, materials: false,
              mortgageCalculator: true, costBreakdown: true, roomCostAttribution: true,
            });
            toast.success("Recommended settings applied");
          }}
          className="border border-azure px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-azure hover:bg-azure-dim"
        >
          Recommended
        </button>
        <button
          onClick={enableAll}
          className="border border-border px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-text-secondary hover:border-sea-green hover:text-sea-green"
        >
          Enable All
        </button>
        <button
          onClick={disableAll}
          className="border border-border px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-text-secondary hover:border-oxblood hover:text-oxblood"
        >
          Disable All
        </button>
      </div>

      {groups.map((group) => (
        <div key={group} className="mb-6">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-primary">{group}</h2>
          <div className="space-y-1">
            {features
              .filter((f) => f.group === group)
              .map((feature) => (
                <button
                  key={feature.key}
                  onClick={() => toggle(feature.key)}
                  className="flex w-full items-center justify-between border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-border-bright"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-primary">{feature.label}</p>
                    <p className="text-[11px] text-text-tertiary">{feature.description}</p>
                  </div>
                  <div
                    className={`flex h-6 w-10 shrink-0 items-center rounded-full px-0.5 transition-colors ${
                      flags[feature.key] ? "bg-sea-green" : "bg-border"
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full bg-text-primary transition-transform ${
                        flags[feature.key] ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </div>
                </button>
              ))}
          </div>
        </div>
      ))}

      <div className="mt-12 border-t border-border pt-6">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-oxblood">Danger Zone</h2>
        <button
          onClick={() => {
            if (confirm("This will erase all data. Are you sure?")) {
              resetStore();
              toast.success("All data reset");
            }
          }}
          className="border border-oxblood bg-oxblood-dim px-4 py-2.5 text-sm font-medium text-oxblood hover:bg-oxblood/20"
        >
          Reset All Data
        </button>
      </div>
    </div>
  );
}
