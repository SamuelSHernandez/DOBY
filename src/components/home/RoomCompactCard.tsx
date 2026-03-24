"use client";

import Link from "next/link";
import {
  Sofa, CookingPot, BedDouble, BedSingle, Bath, Utensils,
  Monitor, Car, ArrowDownToLine, Shirt, ArrowUpToLine, Package, Home,
} from "lucide-react";
import type { Room, HomeSystem } from "@/store/types";
import { formatDimensions } from "@/lib/formatters";
import { useFeature } from "@/lib/useFeature";

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
  const showTemp = useFeature("temperature");

  return (
    <Link
      href={`/home/${room.id}`}
      className="block rounded-[10px] border border-[#18181b] bg-[#0d0d0f] px-[18px] py-4 transition-all duration-150 hover:-translate-y-px hover:bg-[#131316]"
    >
      <div className="mb-3.5 flex items-start justify-between">
        <Icon size={20} strokeWidth={1.5} className="text-[#52525b]" />
        {showTemp && (
          <span className="text-sm font-medium text-[#3f3f46]">71&deg;</span>
        )}
      </div>
      <p className="text-[13px] font-medium text-[#a1a1aa]">{room.name}</p>
      <div className="mt-0.5 flex items-center justify-between">
        <p className="text-[11px] text-[#27272a]">
          {formatDimensions(room.widthFt, room.widthIn)} x {formatDimensions(room.heightFt, room.heightIn)}
        </p>
        <p className="text-[10px] text-[#27272a]">
          {linked.length} device{linked.length !== 1 ? "s" : ""}
        </p>
      </div>
    </Link>
  );
}
