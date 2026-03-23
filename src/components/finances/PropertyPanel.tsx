"use client";

import { useDobyStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Property } from "@/store/types";

const fields: { key: keyof Property; label: string; type: string }[] = [
  { key: "address", label: "Address", type: "text" },
  { key: "purchasePrice", label: "Purchase Price", type: "number" },
  { key: "offerDate", label: "Offer Date", type: "date" },
  { key: "closingDate", label: "Closing Date", type: "date" },
  { key: "sellerConcessions", label: "Seller Concessions", type: "number" },
  { key: "squareFeet", label: "Square Feet", type: "number" },
  { key: "yearBuilt", label: "Year Built", type: "number" },
  { key: "lotSize", label: "Lot Size", type: "text" },
];

export default function PropertyPanel() {
  const property = useDobyStore((s) => s.property);
  const update = useDobyStore((s) => s.updateProperty);

  function handleBlur(key: keyof Property, value: string, type: string) {
    const parsed = type === "number" ? Number(value) : value;
    if (parsed !== property[key]) {
      update({ [key]: parsed });
      toast.success("Saved");
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {fields.map((f) => (
        <div key={f.key}>
          <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">{f.label}</Label>
          <Input
            type={f.type}
            defaultValue={property[f.key] ?? ""}
            onBlur={(e) => handleBlur(f.key, e.target.value, f.type)}
            className="mt-1 border-border bg-surface text-text-primary"
          />
        </div>
      ))}
    </div>
  );
}
