"use client";

import Link from "next/link";
import {
  Sofa,
  CookingPot,
  BedDouble,
  BedSingle,
  Bath,
  Utensils,
  Monitor,
  Car,
  ArrowDownToLine,
  Shirt,
  ArrowUpToLine,
  Package,
  Home,
} from "lucide-react";
import type { Room } from "@/store/types";
import { formatDimensions, formatSqFt } from "@/lib/formatters";

const iconMap: Record<string, React.ElementType> = {
  sofa: Sofa,
  "cooking-pot": CookingPot,
  "bed-double": BedDouble,
  "bed-single": BedSingle,
  bath: Bath,
  utensils: Utensils,
  monitor: Monitor,
  car: Car,
  "arrow-down-to-line": ArrowDownToLine,
  shirt: Shirt,
  "arrow-up-to-line": ArrowUpToLine,
  package: Package,
};

export default function RoomCard({ room }: { room: Room }) {
  const Icon = iconMap[room.icon] || Home;
  const sqft = formatSqFt(room.widthFt, room.widthIn, room.heightFt, room.heightIn);

  return (
    <Link
      href={`/home/${room.id}`}
      className="group block border border-border bg-surface transition-colors hover:border-border-bright"
      style={{ borderLeftColor: room.color, borderLeftWidth: "3px" }}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Icon size={18} strokeWidth={2} style={{ color: room.color }} />
          <span className="text-sm font-semibold text-text-primary">
            {room.name}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-4 text-[11px] text-text-tertiary">
          <span>
            {formatDimensions(room.widthFt, room.widthIn)} x{" "}
            {formatDimensions(room.heightFt, room.heightIn)}
          </span>
          <span>{sqft} sq ft</span>
        </div>

        <div className="mt-2 flex items-center gap-4 text-[10px] uppercase tracking-wider text-text-tertiary">
          <span>{room.inventory.length} items</span>
          <span>{room.systemIds.length} systems</span>
        </div>
      </div>
    </Link>
  );
}
