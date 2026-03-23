"use client";

import { useState } from "react";
import { useDobyStore } from "@/store";
import type { InventoryItem, Condition } from "@/store/types";
import { generateId } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters";
import { formatDate } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import StatusBadge from "@/components/shared/StatusBadge";
import { Plus, Pencil, Trash2 } from "lucide-react";

const conditionVariant: Record<Condition, "nominal" | "caution" | "critical" | "neutral"> = {
  excellent: "nominal",
  good: "nominal",
  fair: "caution",
  poor: "critical",
  unknown: "neutral",
};

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

  function openNew() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(item: InventoryItem) {
    setEditing(item);
    setOpen(true);
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      cost: Number(fd.get("cost")) || 0,
      purchaseDate: (fd.get("purchaseDate") as string) || "",
      condition: (fd.get("condition") as Condition) || "unknown",
      notes: (fd.get("notes") as string) || "",
    };

    if (editing) {
      updateItem(roomId, editing.id, data);
    } else {
      addItem(roomId, { id: generateId(), ...data });
    }
    setOpen(false);
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm" className="gap-1.5" onClick={openNew}>
          <Plus size={14} />
          <span>Add Item</span>
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState message="No items yet — add furniture, electronics, decor" />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border border-border bg-surface p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">{item.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-text-tertiary">
                  {item.cost > 0 && <span>{formatCurrency(item.cost)}</span>}
                  {item.purchaseDate && <span>{formatDate(item.purchaseDate)}</span>}
                  <StatusBadge label={item.condition} variant={conditionVariant[item.condition]} />
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(item)}
                  className="touch-target p-2 text-text-tertiary hover:text-text-primary"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => deleteItem(roomId, item.id)}
                  className="touch-target p-2 text-text-tertiary hover:text-oxblood"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-panel text-text-primary sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-wider">
              {editing ? "Edit Item" : "Add Item"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Name</Label>
              <Input
                name="name"
                defaultValue={editing?.name ?? ""}
                required
                className="mt-1 border-border bg-surface text-text-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Cost</Label>
                <Input
                  name="cost"
                  type="number"
                  step="0.01"
                  defaultValue={editing?.cost ?? ""}
                  className="mt-1 border-border bg-surface text-text-primary"
                />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Purchase Date</Label>
                <Input
                  name="purchaseDate"
                  type="date"
                  defaultValue={editing?.purchaseDate ?? ""}
                  className="mt-1 border-border bg-surface text-text-primary"
                />
              </div>
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Condition</Label>
              <Select name="condition" defaultValue={editing?.condition ?? "unknown"}>
                <SelectTrigger className="mt-1 border-border bg-surface text-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-panel text-text-primary">
                  {(["excellent", "good", "fair", "poor", "unknown"] as const).map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Notes</Label>
              <Textarea
                name="notes"
                defaultValue={editing?.notes ?? ""}
                className="mt-1 border-border bg-surface text-text-primary"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} className="border-border text-text-secondary">
                Cancel
              </Button>
              <Button type="submit" size="sm">
                {editing ? "Save" : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
