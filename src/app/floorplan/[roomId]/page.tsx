"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useDobyStore } from "@/store";
import FloorPlanEditor from "@/components/floorplan/FloorPlanEditor";
import { ArrowLeft } from "lucide-react";

export default function RoomFloorPlanPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const router = useRouter();
  const room = useDobyStore((s) => s.rooms.find((r) => r.id === roomId));

  if (!room) {
    return (
      <div>
        <p className="text-text-tertiary">Room not found.</p>
        <button onClick={() => router.push("/floorplan")} className="mt-4 text-xs text-azure hover:underline">
          Back to Floor Plan
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.push(`/home/${roomId}`)}
        className="mb-4 flex min-h-[44px] items-center gap-1.5 text-xs text-azure hover:underline"
      >
        <ArrowLeft size={14} />
        <span>Back to {room.name}</span>
      </button>

      <h1 className="mb-4 text-lg font-bold text-text-primary">{room.name} — Floor Plan</h1>

      <div className="rounded border border-border overflow-hidden">
        <FloorPlanEditor planId={roomId} />
      </div>
    </div>
  );
}
