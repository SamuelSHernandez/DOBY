"use client";

import { useDobyStore } from "@/store";
import { formatSqFt } from "@/lib/formatters";

export default function RoomCostAttribution() {
  const rooms = useDobyStore((s) => s.rooms);

  if (rooms.length === 0) {
    return <p className="py-6 text-xs text-text-tertiary">No rooms configured.</p>;
  }

  const roomData = rooms.map((r) => ({
    name: r.name,
    color: r.color,
    sqft: formatSqFt(r.widthFt, r.widthIn, r.heightFt, r.heightIn),
  }));

  const totalSqFt = roomData.reduce((sum, r) => sum + r.sqft, 0);
  const sorted = [...roomData].sort((a, b) => b.sqft - a.sqft);
  const maxPct = totalSqFt > 0 ? (sorted[0].sqft / totalSqFt) * 100 : 0;

  return (
    <div>
      <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-text-primary">Room cost attribution</h2>
      <div className="space-y-3">
        {sorted.map((room) => {
          const pct = totalSqFt > 0 ? (room.sqft / totalSqFt) * 100 : 0;
          return (
            <div key={room.name}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm text-text-secondary">{room.name}</span>
                <span className="text-sm text-text-tertiary">{Math.round(pct)}%</span>
              </div>
              <div className="h-2 w-full bg-carbon">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${(pct / Math.max(maxPct, 1)) * 100}%`,
                    backgroundColor: room.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
