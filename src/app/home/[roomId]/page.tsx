"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useDobyStore } from "@/store";
import { formatDimensions, formatSqFt } from "@/lib/formatters";
import { yearsFractional } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import StatBox from "@/components/shared/StatBox";
import StatusBadge from "@/components/shared/StatusBadge";
import RoomSystemsList from "@/components/home/RoomSystemsList";
import { ArrowLeft } from "lucide-react";

export default function RoomDetailPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const router = useRouter();
  const room = useDobyStore((s) => s.rooms.find((r) => r.id === roomId));
  const allSystems = useDobyStore((s) => s.systems);
  const allRooms = useDobyStore((s) => s.rooms);
  const property = useDobyStore((s) => s.property);

  if (!room) {
    return (
      <div>
        <p className="text-text-tertiary">Room not found.</p>
        <Button variant="outline" size="sm" className="mt-4 border-border text-text-secondary" onClick={() => router.push("/home")}>
          Back to Home
        </Button>
      </div>
    );
  }

  const linkedSystems = allSystems.filter((s) => room.systemIds.includes(s.id));
  const sqft = formatSqFt(room.widthFt, room.widthIn, room.heightFt, room.heightIn);

  // Room health status from linked systems
  const worstPct = linkedSystems.reduce((worst, sys) => {
    if (!sys.installDate || sys.estimatedLifeYears <= 0) return worst;
    const pct = (yearsFractional(sys.installDate) / sys.estimatedLifeYears) * 100;
    return Math.max(worst, pct);
  }, 0);
  const healthVariant = worstPct > 80 ? "critical" : worstPct > 50 ? "caution" : "nominal";
  const healthLabel = worstPct > 80 ? "Critical" : worstPct > 50 ? "Aging" : "Nominal";

  // Cost share (proportional by sq ft)
  const totalSqFt = allRooms.reduce((sum, r) => sum + formatSqFt(r.widthFt, r.widthIn, r.heightFt, r.heightIn), 0);
  const costSharePct = totalSqFt > 0 ? Math.round((sqft / totalSqFt) * 100) : 0;

  return (
    <div>
      <button
        onClick={() => router.push("/home")}
        className="mb-4 flex min-h-[44px] items-center gap-1.5 text-xs text-azure hover:underline"
      >
        <ArrowLeft size={14} />
        <span>Back to rooms</span>
      </button>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-text-primary">{room.name}</h1>
          <p className="mt-0.5 text-xs text-text-tertiary">
            {formatDimensions(room.widthFt, room.widthIn)} x {formatDimensions(room.heightFt, room.heightIn)} &middot; {sqft} sq ft
          </p>
        </div>
        <StatusBadge label={healthLabel} variant={healthVariant} />
      </div>

      {/* Stat row */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatBox label="Temperature" value="72°F" />
        <StatBox label="Humidity" value="41%" />
        <StatBox label="Cost Share" value={`${costSharePct}%`} />
        <StatBox label="Systems" value={String(linkedSystems.length)} />
      </div>

      {/* Systems */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">Systems</h2>
          <span className="border border-border px-1.5 py-0.5 text-[10px] text-text-tertiary">{linkedSystems.length}</span>
        </div>
        <RoomSystemsList systems={linkedSystems} />
      </div>

      {/* Registered items */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">Registered items</h2>
          <span className="border border-border px-1.5 py-0.5 text-[10px] text-text-tertiary">{room.inventory.length}</span>
        </div>
        {room.inventory.length === 0 ? (
          <p className="py-6 text-xs text-text-tertiary">No items registered in this room.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {room.inventory.map((item) => (
              <div key={item.id} className="border border-border bg-surface p-4">
                <p className="text-sm font-semibold text-text-primary">{item.name}</p>
                {item.notes && (
                  <p className="mt-0.5 text-[11px] text-text-tertiary">{item.notes}</p>
                )}
                {item.purchaseDate && (
                  <p className="mt-1 text-[11px] text-text-tertiary">
                    Warranty expires {item.purchaseDate}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
