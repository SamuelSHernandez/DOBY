"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useDobyStore } from "@/store";
import { formatDimensions, formatSqFt, formatSqFtDisplay, formatCurrency } from "@/lib/formatters";
import { yearsFractional, formatDate } from "@/lib/dates";
import { generateId } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import StatusBadge from "@/components/shared/StatusBadge";
import RoomSystemsList from "@/components/home/RoomSystemsList";
import InventoryList from "@/components/home/InventoryList";
import WishlistList from "@/components/home/WishlistList";
import RoomFormDialog from "@/components/home/RoomFormDialog";
import { useFeature } from "@/lib/useFeature";
import Link from "next/link";
import { ArrowLeft, Pencil, PenTool, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
  const showWishlist = useFeature("wishlist");
  const showFloorPlan = useFeature("floorPlanEditor");
  const updateRoomNotes = useDobyStore((s) => s.updateRoomNotes);
  const addMaintenanceEntry = useDobyStore((s) => s.addMaintenanceEntry);
  const deleteMaintenanceEntry = useDobyStore((s) => s.deleteMaintenanceEntry);
  const addRoomPhoto = useDobyStore((s) => s.addRoomPhoto);
  const deleteRoomPhoto = useDobyStore((s) => s.deleteRoomPhoto);

  const [maintInput, setMaintInput] = useState("");
  const [photoInput, setPhotoInput] = useState("");

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
  const sqftDisplay = formatSqFtDisplay(room.widthFt, room.widthIn, room.heightFt, room.heightIn);
  const hasDimensions = room.widthFt > 0 || room.widthIn > 0;

  // Room health
  const worstPct = linkedSystems.reduce((worst, sys) => {
    if (!sys.installDate || sys.estimatedLifeYears <= 0) return worst;
    return Math.max(worst, (yearsFractional(sys.installDate) / sys.estimatedLifeYears) * 100);
  }, 0);
  const healthVariant = worstPct > 80 ? "critical" : worstPct > 50 ? "caution" : "nominal";
  const healthLabel = worstPct > 80 ? "Critical" : worstPct > 50 ? "Aging" : "Nominal";

  // Cost share
  const totalSqFt = allRooms.reduce((sum, r) => sum + formatSqFt(r.widthFt, r.widthIn, r.heightFt, r.heightIn), 0);
  const costSharePct = totalSqFt > 0 ? Math.round((sqft / totalSqFt) * 100) : 0;

  // Cost intelligence
  const inventorySpent = room.inventory.reduce((s, i) => s + (i.cost || 0), 0);
  const wishlistTotal = room.wishlist.reduce((s, i) => s + (i.price || 0), 0);
  const hasCostData = inventorySpent > 0 || wishlistTotal > 0;

  return (
    <div>
      <button onClick={() => router.push("/home")}
        className="mb-4 flex min-h-[44px] items-center gap-1.5 text-xs text-azure hover:underline">
        <ArrowLeft size={14} />
        <span>Back to rooms</span>
      </button>

      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-text-primary">{room.name}</h1>
          <p className="mt-0.5 text-xs text-text-tertiary">
            {hasDimensions ? (
              <>{formatDimensions(room.widthFt, room.widthIn)} x {formatDimensions(room.heightFt, room.heightIn)} &middot; {sqftDisplay} &middot; {costSharePct}% cost share</>
            ) : (
              <>Dimensions not set</>
            )}
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

      {/* System pills */}
      <div className="mb-4">
        <RoomSystemsList systems={[...wholeHomeSystems, ...roomSpecificLinked]} />
      </div>

      {/* Cost intelligence */}
      {hasCostData && (
        <div className="mb-6 flex flex-wrap gap-4 border border-border bg-surface px-4 py-3 text-[11px]">
          {inventorySpent > 0 && (
            <span className="text-text-secondary">Spent: <span className="text-text-primary font-semibold">{formatCurrency(inventorySpent)}</span></span>
          )}
          {wishlistTotal > 0 && (
            <span className="text-text-secondary">Wishlist: <span className="text-text-primary font-semibold">{formatCurrency(wishlistTotal)}</span></span>
          )}
          {inventorySpent > 0 && wishlistTotal > 0 && costSharePct > 0 && (
            <span className="text-text-tertiary">
              If you buy everything: {formatCurrency(inventorySpent + wishlistTotal)} total, {formatCurrency(Math.round((inventorySpent + wishlistTotal) * costSharePct / 100))} your share ({costSharePct}%)
            </span>
          )}
        </div>
      )}

      {/* Inventory */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">Inventory</h2>
            <span className="border border-border px-1.5 py-0.5 text-[10px] text-text-tertiary">{room.inventory.length}</span>
          </div>
        </div>
        <InventoryList roomId={room.id} items={room.inventory} />
      </div>

      {/* Wishlist */}
      {showWishlist && (
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">Wishlist</h2>
              <span className="border border-border px-1.5 py-0.5 text-[10px] text-text-tertiary">{room.wishlist.length}</span>
            </div>
          </div>
          <WishlistList roomId={room.id} items={room.wishlist} />
        </div>
      )}

      {/* Notes */}
      <div className="mb-6">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-primary">Notes</h2>
        <Textarea
          defaultValue={room.notes || ""}
          placeholder="Room notes — painted 3/15, patched drywall, anything worth remembering..."
          className="border-border bg-surface text-text-primary text-sm min-h-[60px]"
          onBlur={(e) => {
            if (e.target.value !== (room.notes || "")) {
              updateRoomNotes(roomId, e.target.value);
              toast.success("Notes saved");
            }
          }}
        />
      </div>

      {/* Maintenance Log */}
      <div className="mb-6">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-primary">Maintenance Log</h2>
        <div className="mb-2">
          <Input
            value={maintInput}
            onChange={(e) => setMaintInput(e.target.value)}
            placeholder="What was done? Press Enter to add..."
            className="border-border bg-surface text-text-primary text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && maintInput.trim()) {
                addMaintenanceEntry(roomId, {
                  id: generateId(),
                  date: new Date().toISOString().slice(0, 10),
                  description: maintInput.trim(),
                });
                setMaintInput("");
              }
            }}
          />
        </div>
        {(room.maintenanceLog || []).length > 0 && (
          <div className="space-y-0.5">
            {[...(room.maintenanceLog || [])].reverse().map((entry) => (
              <div key={entry.id} className="flex items-center justify-between border border-border bg-surface px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0 text-[10px] text-text-tertiary font-mono">{formatDate(entry.date)}</span>
                  <span className="text-sm text-text-primary truncate">{entry.description}</span>
                </div>
                <button onClick={() => deleteMaintenanceEntry(roomId, entry.id)}
                  className="touch-target p-2 shrink-0 text-text-tertiary hover:text-oxblood">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photos */}
      <div className="mb-6">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-primary">Photos</h2>
        <div className="mb-2">
          <Input
            value={photoInput}
            onChange={(e) => setPhotoInput(e.target.value)}
            placeholder="Paste image URL + Enter..."
            className="border-border bg-surface text-text-primary text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && photoInput.trim()) {
                addRoomPhoto(roomId, {
                  id: generateId(),
                  url: photoInput.trim(),
                  date: new Date().toISOString().slice(0, 10),
                });
                setPhotoInput("");
              }
            }}
          />
        </div>
        {(room.photos || []).length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {(room.photos || []).map((photo) => (
              <div key={photo.id} className="group relative">
                <img src={photo.url} alt={photo.caption || "Room photo"} referrerPolicy="no-referrer"
                  className="aspect-square w-full rounded object-cover bg-carbon" />
                <button onClick={() => deleteRoomPhoto(roomId, photo.id)}
                  className="absolute top-1 right-1 hidden rounded bg-carbon/80 p-1 text-text-tertiary hover:text-oxblood group-hover:block">
                  <Trash2 size={12} />
                </button>
                {photo.date && <span className="absolute bottom-1 left-1 rounded bg-carbon/80 px-1 py-0.5 text-[9px] text-text-tertiary">{photo.date}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floor Plan link */}
      {showFloorPlan && (
        <div className="mb-6">
          <Link href={`/floorplan/${roomId}`}
            className="flex items-center gap-2 border border-border px-4 py-3 text-xs text-text-secondary hover:bg-surface hover:text-text-primary transition-colors">
            <PenTool size={14} />
            <span>Edit Floor Plan</span>
          </Link>
        </div>
      )}
    </div>
  );
}
