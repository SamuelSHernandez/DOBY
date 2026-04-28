"use client";

import { useState } from "react";
import { useDobyStore } from "@/store";
import type { InventoryItem, Condition } from "@/store/types";
import { generateId } from "@/lib/constants";
import { fd as formData } from "@/lib/form";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EmptyState from "@/components/shared/EmptyState";
import { Plus, Pencil, Trash2, ChevronDown } from "lucide-react";

interface Props {
  roomId: string;
  items: InventoryItem[];
}

export default function InventoryList({ roomId, items }: Props) {
  const addItem = useDobyStore((s) => s.addInventoryItem);
  const updateItem = useDobyStore((s) => s.updateInventoryItem);
  const deleteItem = useDobyStore((s) => s.deleteInventoryItem);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [open, setOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [quickAdd, setQuickAdd] = useState("");

  function handleQuickAdd(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && quickAdd.trim()) {
      addItem(roomId, {
        id: generateId(),
        name: quickAdd.trim(),
        cost: 0,
        purchaseDate: "",
        condition: "unknown" as Condition,
        notes: "",
      });
      setQuickAdd("");
    }
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = formData(new FormData(e.currentTarget));
    const data = {
      name: f.str("name"), cost: f.num("cost"), purchaseDate: f.str("purchaseDate"),
      condition: (f.str("condition") as Condition) || "unknown",
      notes: f.str("notes"), purchaseSource: f.str("purchaseSource"),
      warrantyExpires: f.str("warrantyExpires"),
    };

    if (editing) {
      updateItem(roomId, editing.id, data);
    } else {
      addItem(roomId, { id: generateId(), ...data });
    }
    setOpen(false);
    setShowMore(false);
  }

  return (
    <div>
      {/* Quick add — just type a name and hit Enter */}
      <div className="mb-3">
        <Input
          value={quickAdd}
          onChange={(e) => setQuickAdd(e.target.value)}
          onKeyDown={handleQuickAdd}
          placeholder="Type item name + Enter to add..."
          className="border-border bg-surface text-text-primary text-sm"
        />
      </div>

      {items.length === 0 ? (
        <EmptyState message="No items yet — type above to add furniture, electronics, decor" />
      ) : (
        <div className="space-y-0.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border border-border bg-surface px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm text-text-primary truncate">{item.name}</span>
                {item.cost > 0 && (
                  <span className="shrink-0 text-[11px] text-text-tertiary">{formatCurrency(item.cost)}</span>
                )}
                {(item.purchaseSource || item.vendor) && (
                  <span className="shrink-0 text-[10px] text-text-tertiary">{item.purchaseSource || item.vendor}</span>
                )}
                {item.warrantyExpires && (
                  <span className={`shrink-0 text-[10px] ${new Date(item.warrantyExpires) < new Date() ? "text-oxblood" : "text-text-tertiary"}`}>
                    warranty {new Date(item.warrantyExpires) < new Date() ? "expired" : item.warrantyExpires.slice(0, 7)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => { setEditing(item); setShowMore(true); setOpen(true); }}
                  className="touch-target p-2 text-text-tertiary hover:text-text-primary"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => deleteItem(roomId, item.id)}
                  className="touch-target p-2 text-text-tertiary hover:text-oxblood"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit dialog — only opens when clicking the pencil */}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setShowMore(false); } }}>
        <DialogContent className="border-border bg-panel text-text-primary sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-wider">
              {editing ? "Edit Item" : "Add Item"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Name</Label>
              <Input name="name" defaultValue={editing?.name ?? ""} required className="mt-1 border-border bg-surface text-text-primary" />
            </div>

            {/* Optional details — collapsed by default */}
            <button
              type="button"
              onClick={() => setShowMore(!showMore)}
              className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-text-tertiary hover:text-text-secondary"
            >
              <ChevronDown size={12} style={{ transform: showMore ? "rotate(180deg)" : "", transition: "transform 0.2s" }} />
              {showMore ? "Less details" : "More details"}
            </button>

            {showMore && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Cost</Label>
                    <Input name="cost" type="number" step="0.01" defaultValue={editing?.cost || ""} className="mt-1 border-border bg-surface text-text-primary" placeholder="Optional" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Where from</Label>
                    <Input name="purchaseSource" defaultValue={editing?.purchaseSource ?? ""} className="mt-1 border-border bg-surface text-text-primary" placeholder="Goodwill, Amazon..." />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Warranty Expires</Label>
                    <Input name="warrantyExpires" type="date" defaultValue={editing?.warrantyExpires ?? ""} className="mt-1 border-border bg-surface text-text-primary" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Condition</Label>
                    <Select name="condition" defaultValue={editing?.condition ?? "unknown"}>
                      <SelectTrigger className="mt-1 border-border bg-surface text-text-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-panel text-text-primary">
                        {(["excellent", "good", "fair", "poor", "unknown"] as const).map((c) => (
                          <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Notes</Label>
                  <Input name="notes" defaultValue={editing?.notes ?? ""} className="mt-1 border-border bg-surface text-text-primary" placeholder="Optional" />
                </div>
              </>
            )}

            {/* Hidden fields when details collapsed */}
            {!showMore && (
              <>
                <input type="hidden" name="cost" value={editing?.cost ?? 0} />
                <input type="hidden" name="condition" value={editing?.condition ?? "unknown"} />
                <input type="hidden" name="notes" value={editing?.notes ?? ""} />
                <input type="hidden" name="purchaseSource" value={editing?.purchaseSource ?? ""} />
                <input type="hidden" name="warrantyExpires" value={editing?.warrantyExpires ?? ""} />
              </>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} className="border-border text-text-secondary">Cancel</Button>
              <Button type="submit" size="sm">{editing ? "Save" : "Add"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
