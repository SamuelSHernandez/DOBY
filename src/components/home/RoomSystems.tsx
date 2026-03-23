"use client";

import { useDobyStore } from "@/store";
import EmptyState from "@/components/shared/EmptyState";
import StatusBadge from "@/components/shared/StatusBadge";
import { X } from "lucide-react";
import { yearsFractional } from "@/lib/dates";

interface Props {
  roomId: string;
  systemIds: string[];
}

export default function RoomSystems({ roomId, systemIds }: Props) {
  const systems = useDobyStore((s) => s.systems);
  const allSystems = useDobyStore((s) => s.systems);
  const linkSystem = useDobyStore((s) => s.linkSystem);
  const unlinkSystem = useDobyStore((s) => s.unlinkSystem);

  const linked = systems.filter((s) => systemIds.includes(s.id));
  const available = allSystems.filter((s) => !systemIds.includes(s.id));

  function getVariant(sys: typeof systems[0]) {
    if (!sys.installDate) return "neutral" as const;
    const age = yearsFractional(sys.installDate);
    const pct = (age / sys.estimatedLifeYears) * 100;
    if (pct > 80) return "critical" as const;
    if (pct > 50) return "caution" as const;
    return "nominal" as const;
  }

  return (
    <div>
      {linked.length === 0 && available.length === 0 ? (
        <EmptyState message="No systems configured — add systems from the Systems page first" />
      ) : (
        <>
          {linked.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
                Linked Systems
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
                Available Systems
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
        </>
      )}
    </div>
  );
}
