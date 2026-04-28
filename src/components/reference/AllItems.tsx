"use client";

import { useDobyStore } from "@/store";
import { formatDate } from "@/lib/dates";

interface FlatItem {
  name: string;
  notes: string;
  roomName: string;
  purchaseDate: string;
}

export default function AllItems() {
  const rooms = useDobyStore((s) => s.rooms);

  const items: FlatItem[] = [];
  for (const room of rooms) {
    for (const item of room.inventory) {
      items.push({
        name: item.name,
        notes: item.notes || "",
        roomName: room.name,
        purchaseDate: item.purchaseDate,
      });
    }
  }

  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">All registered items</h2>
        <span className="border border-border px-1.5 py-0.5 text-[10px] text-text-tertiary">{sorted.length}</span>
      </div>

      {sorted.length === 0 ? (
        <p className="py-6 text-xs text-text-tertiary">No items registered. Add inventory to rooms to see them here.</p>
      ) : (
        <div className="space-y-1">
          {sorted.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between border border-border bg-surface px-4 py-3"
            >
              <div>
                <p className="text-sm text-text-primary">{item.name}</p>
                {item.notes && (
                  <p className="text-[11px] text-text-tertiary">{item.notes}</p>
                )}
              </div>
              <div className="flex items-center gap-4 text-[11px] text-text-tertiary">
                <span>{item.roomName}</span>
                {item.purchaseDate && <span>{formatDate(item.purchaseDate)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
