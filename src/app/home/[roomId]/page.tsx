"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useDobyStore } from "@/store";
import { formatDimensions, formatSqFt, formatCurrency } from "@/lib/formatters";
import { yearsFractional } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import StatBox from "@/components/shared/StatBox";
import StatusBadge from "@/components/shared/StatusBadge";
import RoomSystemsList from "@/components/home/RoomSystemsList";
import RoomSystems from "@/components/home/RoomSystems";
import InventoryList from "@/components/home/InventoryList";
import WishlistList from "@/components/home/WishlistList";
import MaterialsForm from "@/components/home/MaterialsForm";
import RoomFormDialog from "@/components/home/RoomFormDialog";
import { useFeature } from "@/lib/useFeature";
import { ArrowLeft, Pencil } from "lucide-react";

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
  const showTemp = useFeature("temperature");
  const showHumidity = useFeature("humidity");
  const showWishlist = useFeature("wishlist");
  const showMaterials = useFeature("materials");

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
  const wholeHomeSystems = allSystems.filter((s) => s.scope === "whole-home");
  const roomSpecificLinked = linkedSystems.filter((s) => s.scope !== "whole-home");
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
        <div className="flex items-center gap-2">
          <RoomFormDialog
            room={room}
            trigger={
              <Button variant="outline" size="icon-sm" className="border-border text-text-tertiary">
                <Pencil size={14} />
              </Button>
            }
          />
          <StatusBadge label={healthLabel} variant={healthVariant} />
        </div>
      </div>

      {/* Stat row */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {showTemp && <StatBox label="Temperature" value="72°F" />}
        {showHumidity && <StatBox label="Humidity" value="41%" />}
        <StatBox label="Cost Share" value={`${costSharePct}%`} />
        <StatBox label="Systems" value={String(wholeHomeSystems.length + roomSpecificLinked.length)} />
      </div>

      {/* Whole-home systems — read-only, these cover the entire property */}
      {wholeHomeSystems.length > 0 && (
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">Whole-Home Systems</h2>
            <span className="border border-border px-1.5 py-0.5 text-[10px] text-text-tertiary">{wholeHomeSystems.length}</span>
          </div>
          <RoomSystemsList systems={wholeHomeSystems} />
        </div>
      )}

      {/* Room-specific systems — linkable */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">Room Systems</h2>
          <span className="border border-border px-1.5 py-0.5 text-[10px] text-text-tertiary">{roomSpecificLinked.length}</span>
        </div>
        {roomSpecificLinked.length > 0 && (
          <RoomSystemsList systems={roomSpecificLinked} />
        )}
        <div className={roomSpecificLinked.length > 0 ? "mt-4" : ""}>
          <RoomSystems roomId={room.id} systemIds={room.systemIds} />
        </div>
      </div>

      {/* Inventory */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">Inventory</h2>
            <span className="border border-border px-1.5 py-0.5 text-[10px] text-text-tertiary">{room.inventory.length}</span>
          </div>
          {room.inventory.length > 0 && (
            <span className="text-[11px] text-text-secondary">
              Total: {formatCurrency(room.inventory.reduce((sum, i) => sum + i.cost, 0))}
            </span>
          )}
        </div>
        <InventoryList roomId={room.id} items={room.inventory} />
      </div>

      {/* Wishlist */}
      {showWishlist && (
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">Wishlist</h2>
              <span className="border border-border px-1.5 py-0.5 text-[10px] text-text-tertiary">{room.wishlist.length}</span>
            </div>
            {room.wishlist.length > 0 && (
              <span className="text-[11px] text-text-secondary">
                Total: {formatCurrency(room.wishlist.reduce((sum, i) => sum + i.price, 0))}
              </span>
            )}
          </div>
          <WishlistList roomId={room.id} items={room.wishlist} />
        </div>
      )}

      {/* Materials */}
      {showMaterials && (
        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-primary">Materials &amp; Finishes</h2>
          <MaterialsForm roomId={room.id} materials={room.materials} />
        </div>
      )}
    </div>
  );
}
