"use client";

import { useDobyStore } from "@/store";
import type { RoomMaterials } from "@/store/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Props {
  roomId: string;
  materials: RoomMaterials;
}

const fields: { key: keyof RoomMaterials; label: string }[] = [
  { key: "wallColor", label: "Wall Color" },
  { key: "wallBrand", label: "Wall Brand" },
  { key: "trimColor", label: "Trim Color" },
  { key: "trimBrand", label: "Trim Brand" },
  { key: "ceilingColor", label: "Ceiling Color" },
  { key: "ceilingBrand", label: "Ceiling Brand" },
  { key: "flooring", label: "Flooring" },
  { key: "flooringBrand", label: "Flooring Brand" },
  { key: "tile", label: "Tile" },
  { key: "tileBrand", label: "Tile Brand" },
];

export default function MaterialsForm({ roomId, materials }: Props) {
  const updateMaterials = useDobyStore((s) => s.updateRoomMaterials);

  function handleBlur(key: keyof RoomMaterials, value: string) {
    if (value !== materials[key]) {
      updateMaterials(roomId, { [key]: value });
      toast.success("Saved");
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map(({ key, label }) => (
        <div key={key}>
          <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">
            {label}
          </Label>
          <Input
            defaultValue={materials[key]}
            onBlur={(e) => handleBlur(key, e.target.value)}
            className="mt-1 border-border bg-surface text-text-primary"
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        </div>
      ))}
    </div>
  );
}
