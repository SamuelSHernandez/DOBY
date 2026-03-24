"use client";

import { useDobyStore } from "@/store";
import StatusBadge from "@/components/shared/StatusBadge";
import { X } from "lucide-react";
import { yearsFractional } from "@/lib/dates";

interface Props {
  roomId: string;
  systemIds: string[];
}

export default function RoomSystems({ roomId, systemIds }: Props) {
  const allSystems = useDobyStore((s) => s.systems);
  const linkSystem = useDobyStore((s) => s.linkSystem);
  const unlinkSystem = useDobyStore((s) => s.unlinkSystem);

  // Only show room-specific systems for linking — whole-home systems apply automatically
  const roomSpecific = allSystems.filter((s) => s.scope !== "whole-home");
  const linked = roomSpecific.filter((s) => systemIds.includes(s.id));
  const available = roomSpecific.filter((s) => !systemIds.includes(s.id));

  function getVariant(sys: typeof allSystems[0]) {
    if (!sys.installDate) return "neutral" as const;
    const age = yearsFractional(sys.installDate);
    const pct = (age / sys.estimatedLifeYears) * 100;
    if (pct > 80) return "critical" as const;
    if (pct > 50) return "caution" as const;
    return "nominal" as const;
  }

  if (roomSpecific.length === 0) {
    return (
      <p className="py-4 text-xs text-text-tertiary">
        No room-specific systems configured. Add appliances from the Systems page to link them here.
      </p>
    );
  }

  return (
    <div>
      {linked.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
            Linked to this room
          </p>
          <div className="flex flex-wrap gap-2">
            {linked.map((sys) => (
              <div
                key={sys.id}
                className="flex min-h-[44px] items-center gap-2 border border-border bg-surface px-3 py-1.5"
              >
                <StatusBadge label={sys.name} variant={getVariant(sys)} />
                <button
                  onClick={() => unlinkSystem(roomId, sys.id)}
                  className="text-text-tertiary hover:text-oxblood"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {available.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
            Available to link
          </p>
          <div className="flex flex-wrap gap-2">
            {available.map((sys) => (
              <button
                key={sys.id}
                onClick={() => linkSystem(roomId, sys.id)}
                className="min-h-[44px] border border-border bg-surface px-3 py-2 text-[11px] text-text-secondary transition-colors hover:border-azure hover:text-azure"
              >
                + {sys.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
