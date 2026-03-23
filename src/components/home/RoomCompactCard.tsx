"use client";

import Link from "next/link";
import {
  Sofa, CookingPot, BedDouble, BedSingle, Bath, Utensils,
  Monitor, Car, ArrowDownToLine, Shirt, ArrowUpToLine, Package, Home,
} from "lucide-react";
import type { Room, HomeSystem } from "@/store/types";
import { formatDimensions } from "@/lib/formatters";

const iconMap: Record<string, React.ElementType> = {
  sofa: Sofa, "cooking-pot": CookingPot, "bed-double": BedDouble,
  "bed-single": BedSingle, bath: Bath, utensils: Utensils, monitor: Monitor,
  car: Car, "arrow-down-to-line": ArrowDownToLine, shirt: Shirt,
  "arrow-up-to-line": ArrowUpToLine, package: Package,
};

interface Props {
  room: Room;
  systems: HomeSystem[];
}

export default function RoomCompactCard({ room, systems }: Props) {
  const Icon = iconMap[room.icon] || Home;
  const linked = systems.filter((s) => room.systemIds.includes(s.id));

  return (
    <Link
      href={`/home/${room.id}`}
      className="block border border-border bg-surface transition-colors hover:border-border-bright"
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon size={14} strokeWidth={2} className="text-text-tertiary" />
            <span className="text-sm font-semibold text-text-primary">{room.name}</span>
          </div>
          <span className="text-xs text-text-tertiary" style={{ color: room.color }}>
            &bull;
          </span>
        </div>

        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-[11px] text-text-tertiary">
            {formatDimensions(room.widthFt, room.widthIn)} x {formatDimensions(room.heightFt, room.heightIn)}
          </span>
          <span className="text-lg font-semibold text-text-primary">71&deg;</span>
        </div>

        {linked.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {linked.slice(0, 4).map((sys) => (
              <span
                key={sys.id}
                className="border border-border px-1.5 py-0.5 text-[10px] text-text-tertiary"
              >
                {sys.name.length > 12 ? sys.name.slice(0, 12) + "…" : sys.name}
              </span>
            ))}
            {linked.length > 4 && (
              <span className="px-1.5 py-0.5 text-[10px] text-text-tertiary">
                +{linked.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
