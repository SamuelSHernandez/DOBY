"use client";

import { useDobyStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { EmergencyInfo } from "@/store/types";

const fields: { key: keyof EmergencyInfo; label: string; sensitive?: boolean }[] = [
  { key: "waterMainLocation", label: "Water Main Shutoff" },
  { key: "gasShutoffLocation", label: "Gas Shutoff" },
  { key: "breakerPanelLocation", label: "Breaker Panel" },
  { key: "sewerCleanoutLocation", label: "Sewer Cleanout" },
  { key: "securityCode", label: "Security Code", sensitive: true },
  { key: "wifiPassword", label: "WiFi Password", sensitive: true },
];

export default function EmergencyPanel() {
  const info = useDobyStore((s) => s.emergencyInfo);
  const update = useDobyStore((s) => s.updateEmergencyInfo);

  function handleBlur(key: keyof EmergencyInfo, value: string) {
    if (value !== info[key]) {
      update({ [key]: value });
      toast.success("Saved");
    }
  }

  return (
    <div className="border-l-[3px] border-l-oxblood border border-border bg-surface p-4">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-oxblood">
        Emergency Information
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key}>
            <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">
              {f.label}
            </Label>
            <Input
              type={f.sensitive ? "password" : "text"}
              defaultValue={info[f.key]}
              onBlur={(e) => handleBlur(f.key, e.target.value)}
              className="mt-1 border-border bg-carbon text-text-primary"
            />
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Notes</Label>
        <Textarea
          defaultValue={info.notes}
          onBlur={(e) => handleBlur("notes", e.target.value)}
          className="mt-1 border-border bg-carbon text-text-primary"
          rows={3}
          placeholder="Fire extinguisher locations, alarm codes, etc."
        />
      </div>
    </div>
  );
}
