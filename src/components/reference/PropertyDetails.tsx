"use client";

import { useDobyStore } from "@/store";
import { useShallow } from "zustand/react/shallow";
import { formatNumber } from "@/lib/formatters";

export default function PropertyDetails() {
  const { property, rooms, systems } = useDobyStore(useShallow((s) => ({
    property: s.property, rooms: s.rooms, systems: s.systems,
  })));

  const details = [
    { label: "Address", value: property.address || "—" },
    { label: "Total sq ft", value: property.squareFeet > 0 ? `${formatNumber(property.squareFeet)} sq ft` : "—" },
    { label: "Rooms tracked", value: String(rooms.length) },
    { label: "Systems tracked", value: String(systems.length) },
  ];

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-text-primary">Property details</h2>
      <div className="space-y-1">
        {details.map((d) => (
          <div
            key={d.label}
            className="flex items-center justify-between border border-border bg-surface px-4 py-3"
          >
            <span className="text-sm text-text-tertiary">{d.label}</span>
            <span className="text-sm text-text-primary">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
