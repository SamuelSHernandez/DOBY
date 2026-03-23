"use client";

import { useDobyStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { InsurancePolicy } from "@/store/types";

const fields: { key: keyof InsurancePolicy; label: string; type: string }[] = [
  { key: "policyNumber", label: "Policy Number", type: "text" },
  { key: "provider", label: "Provider", type: "text" },
  { key: "agentName", label: "Agent Name", type: "text" },
  { key: "agentPhone", label: "Agent Phone", type: "tel" },
  { key: "agentEmail", label: "Agent Email", type: "email" },
  { key: "coverageAmount", label: "Coverage Amount", type: "number" },
  { key: "deductible", label: "Deductible", type: "number" },
  { key: "renewalDate", label: "Renewal Date", type: "date" },
  { key: "premiumAnnual", label: "Annual Premium", type: "number" },
];

export default function InsurancePanel() {
  const insurance = useDobyStore((s) => s.insurance);
  const update = useDobyStore((s) => s.updateInsurance);

  function handleBlur(key: keyof InsurancePolicy, value: string, type: string) {
    const parsed = type === "number" ? Number(value) : value;
    if (parsed !== insurance[key]) {
      update({ [key]: parsed });
      toast.success("Saved");
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((f) => (
          <div key={f.key}>
            <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">{f.label}</Label>
            <Input
              type={f.type}
              defaultValue={insurance[f.key] ?? ""}
              onBlur={(e) => handleBlur(f.key, e.target.value, f.type)}
              className="mt-1 border-border bg-surface text-text-primary"
            />
          </div>
        ))}
      </div>
      <div>
        <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Notes</Label>
        <Textarea
          defaultValue={insurance.notes}
          onBlur={(e) => {
            if (e.target.value !== insurance.notes) {
              update({ notes: e.target.value });
              toast.success("Saved");
            }
          }}
          className="mt-1 border-border bg-surface text-text-primary"
          rows={3}
        />
      </div>
    </div>
  );
}
