"use client";

import { useState } from "react";
import { useDobyStore } from "@/store";
import type { RoomMaterials } from "@/store/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const MATERIAL_GROUPS: {
  label: string;
  colorKey: keyof RoomMaterials;
  brandKey: keyof RoomMaterials;
  colorLabel: string;
  brandLabel: string;
}[] = [
  { label: "Walls", colorKey: "wallColor", brandKey: "wallBrand", colorLabel: "Color", brandLabel: "Brand" },
  { label: "Trim", colorKey: "trimColor", brandKey: "trimBrand", colorLabel: "Color", brandLabel: "Brand" },
  { label: "Ceiling", colorKey: "ceilingColor", brandKey: "ceilingBrand", colorLabel: "Color", brandLabel: "Brand" },
  { label: "Flooring", colorKey: "flooring", brandKey: "flooringBrand", colorLabel: "Type", brandLabel: "Brand" },
  { label: "Tile", colorKey: "tile", brandKey: "tileBrand", colorLabel: "Type", brandLabel: "Brand" },
];

export default function MaterialsPanel() {
  const globalMaterials = useDobyStore((s) => s.globalMaterials);
  const updateGlobal = useDobyStore((s) => s.updateGlobalMaterials);
  const rooms = useDobyStore((s) => s.rooms);

  const [expanded, setExpanded] = useState<string | null>(null);

  function handleBlur(key: keyof RoomMaterials, value: string) {
    if (value !== globalMaterials[key]) {
      updateGlobal({ [key]: value });
      toast.success("Saved");
    }
  }

  // Count rooms with overrides for each group
  function overrideCount(colorKey: keyof RoomMaterials, brandKey: keyof RoomMaterials): number {
    return rooms.filter((r) => r.materials[colorKey] !== "" || r.materials[brandKey] !== "").length;
  }

  return (
    <div className="space-y-1">
      {MATERIAL_GROUPS.map((group) => {
        const color = globalMaterials[group.colorKey];
        const brand = globalMaterials[group.brandKey];
        const overrides = overrideCount(group.colorKey, group.brandKey);
        const isOpen = expanded === group.label;

        return (
          <div key={group.label} className="border border-border">
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : group.label)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary w-16">
                  {group.label}
                </span>
                <span className="text-sm text-text-primary">
                  {color || "Not set"}
                </span>
                {brand && (
                  <span className="text-xs text-text-tertiary">({brand})</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {overrides > 0 && (
                  <span className="text-[9px] text-text-tertiary">
                    {overrides} room override{overrides > 1 ? "s" : ""}
                  </span>
                )}
                <span
                  className="text-text-tertiary text-xs transition-transform"
                  style={{ transform: isOpen ? "rotate(180deg)" : "" }}
                >
                  ▼
                </span>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-border bg-surface px-4 py-4">
                <p className="mb-3 text-[10px] text-text-tertiary">
                  House-wide default. Rooms inherit this unless they have a custom override.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">
                      {group.colorLabel}
                    </Label>
                    <Input
                      key={`g-${group.colorKey}-${globalMaterials[group.colorKey]}`}
                      defaultValue={globalMaterials[group.colorKey]}
                      onBlur={(e) => handleBlur(group.colorKey, e.target.value)}
                      className="mt-1 border-border bg-carbon text-text-primary"
                      placeholder={`Enter ${group.colorLabel.toLowerCase()}...`}
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">
                      {group.brandLabel}
                    </Label>
                    <Input
                      key={`g-${group.brandKey}-${globalMaterials[group.brandKey]}`}
                      defaultValue={globalMaterials[group.brandKey]}
                      onBlur={(e) => handleBlur(group.brandKey, e.target.value)}
                      className="mt-1 border-border bg-carbon text-text-primary"
                      placeholder={`Enter ${group.brandLabel.toLowerCase()}...`}
                    />
                  </div>
                </div>

                {/* Show which rooms have overrides */}
                {overrides > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {rooms
                      .filter((r) => r.materials[group.colorKey] !== "" || r.materials[group.brandKey] !== "")
                      .map((r) => (
                        <span key={r.id} className="rounded bg-azure/10 px-1.5 py-0.5 text-[9px] text-azure">
                          {r.name}: {r.materials[group.colorKey] || r.materials[group.brandKey]}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
