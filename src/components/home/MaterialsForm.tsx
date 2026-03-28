"use client";

import { useState } from "react";
import { useDobyStore } from "@/store";
import type { RoomMaterials } from "@/store/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Props {
  roomId: string;
  materials: RoomMaterials;
}

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

// Marker value to indicate "use house default"
const HOUSE_DEFAULT = "__house_default__";

export default function MaterialsForm({ roomId, materials }: Props) {
  const updateMaterials = useDobyStore((s) => s.updateRoomMaterials);
  const globalMaterials = useDobyStore((s) => s.globalMaterials);
  const updateGlobal = useDobyStore((s) => s.updateGlobalMaterials);

  // Track which fields are in "custom" mode (room has its own value)
  // A field is "custom" if the room has a non-empty value that differs from global
  function isCustom(key: keyof RoomMaterials): boolean {
    return materials[key] !== "" && materials[key] !== HOUSE_DEFAULT;
  }

  function getDisplayValue(key: keyof RoomMaterials): string {
    if (isCustom(key)) return materials[key];
    return globalMaterials[key] || "";
  }

  function handleModeChange(colorKey: keyof RoomMaterials, brandKey: keyof RoomMaterials, useCustom: boolean) {
    if (useCustom) {
      // Switch to custom — prefill with the global value
      updateMaterials(roomId, {
        [colorKey]: globalMaterials[colorKey] || "",
        [brandKey]: globalMaterials[brandKey] || "",
      });
    } else {
      // Switch to house default — clear room overrides
      updateMaterials(roomId, { [colorKey]: "", [brandKey]: "" });
    }
    toast.success("Saved");
  }

  function handleFieldBlur(key: keyof RoomMaterials, value: string) {
    if (value !== materials[key]) {
      updateMaterials(roomId, { [key]: value });
      toast.success("Saved");
    }
  }

  function handleGlobalBlur(key: keyof RoomMaterials, value: string) {
    if (value !== globalMaterials[key]) {
      updateGlobal({ [key]: value });
      toast.success("House default saved");
    }
  }

  // Expandable section state
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-1">
      {MATERIAL_GROUPS.map((group) => {
        const hasCustom = isCustom(group.colorKey) || isCustom(group.brandKey);
        const globalColor = globalMaterials[group.colorKey];
        const globalBrand = globalMaterials[group.brandKey];
        const displayColor = getDisplayValue(group.colorKey);
        const displayBrand = getDisplayValue(group.brandKey);
        const isOpen = expanded === group.label;

        return (
          <div key={group.label} className="border border-border">
            {/* Row header — always visible */}
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
                  {displayColor || "Not set"}
                </span>
                {displayBrand && (
                  <span className="text-xs text-text-tertiary">({displayBrand})</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasCustom ? (
                  <span className="rounded bg-azure/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-azure">Custom</span>
                ) : (globalColor || globalBrand) ? (
                  <span className="text-[9px] uppercase tracking-wider text-text-tertiary">House Default</span>
                ) : null}
                <span className="text-text-tertiary text-xs transition-transform" style={{ transform: isOpen ? "rotate(180deg)" : "" }}>
                  ▼
                </span>
              </div>
            </button>

            {/* Expanded detail */}
            {isOpen && (
              <div className="border-t border-border bg-surface px-4 py-4 space-y-4">
                {/* Mode toggle */}
                <div className="flex items-center gap-2">
                  <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Source</Label>
                  <select
                    value={hasCustom ? "custom" : "default"}
                    onChange={(e) => handleModeChange(group.colorKey, group.brandKey, e.target.value === "custom")}
                    className="rounded border border-border bg-carbon px-2 py-1 text-xs text-text-primary outline-none"
                  >
                    <option value="default">House Default{globalColor ? ` (${globalColor})` : ""}</option>
                    <option value="custom">Custom for this room</option>
                  </select>
                </div>

                {hasCustom ? (
                  /* Custom mode — editable fields for this room */
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">{group.colorLabel}</Label>
                      <Input
                        defaultValue={materials[group.colorKey]}
                        onBlur={(e) => handleFieldBlur(group.colorKey, e.target.value)}
                        className="mt-1 border-border bg-carbon text-text-primary"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">{group.brandLabel}</Label>
                      <Input
                        defaultValue={materials[group.brandKey]}
                        onBlur={(e) => handleFieldBlur(group.brandKey, e.target.value)}
                        className="mt-1 border-border bg-carbon text-text-primary"
                      />
                    </div>
                  </div>
                ) : (
                  /* Default mode — edit the global values */
                  <div>
                    <p className="mb-2 text-[10px] text-text-tertiary">
                      Editing the house default — applies to all rooms using the default.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">{group.colorLabel}</Label>
                        <Input
                          key={`global-${group.colorKey}`}
                          defaultValue={globalMaterials[group.colorKey]}
                          onBlur={(e) => handleGlobalBlur(group.colorKey, e.target.value)}
                          className="mt-1 border-border bg-carbon text-text-primary"
                          placeholder="Set house default..."
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">{group.brandLabel}</Label>
                        <Input
                          key={`global-${group.brandKey}`}
                          defaultValue={globalMaterials[group.brandKey]}
                          onBlur={(e) => handleGlobalBlur(group.brandKey, e.target.value)}
                          className="mt-1 border-border bg-carbon text-text-primary"
                          placeholder="Set house default..."
                        />
                      </div>
                    </div>
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
