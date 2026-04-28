"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import type { Room, HomeSystem } from "@/store/types";
import { formatDimensions } from "@/lib/formatters";
import { roomIconMap } from "@/lib/icons";

interface Props {
  room: Room;
  systems: HomeSystem[];
}

export default function RoomCompactCard({ room, systems }: Props) {
  const Icon = roomIconMap[room.icon] || Home;
  const linked = systems.filter((s) => room.systemIds.includes(s.id));

  return (
    <Link
      href={`/room?roomId=${room.id}`}
      className="block rounded-[10px] border border-border bg-panel px-[18px] py-4 transition-all duration-150 hover:-translate-y-px hover:bg-surface-hover"
    >
      <div className="mb-3.5">
        <Icon size={20} strokeWidth={1.5} className="text-text-dim" />
      </div>
      <p className="text-[13px] font-medium text-text-secondary">{room.name}</p>
      <div className="mt-0.5 flex items-center justify-between">
        <p className="text-[11px] text-border-bright">
          {formatDimensions(room.widthFt, room.widthIn)} x {formatDimensions(room.heightFt, room.heightIn)}
        </p>
        <p className="text-[10px] text-border-bright">
          {linked.length} device{linked.length !== 1 ? "s" : ""}
        </p>
      </div>
    </Link>
  );
}
