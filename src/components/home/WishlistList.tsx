"use client";

import { useState } from "react";
import { useDobyStore } from "@/store";
import type { WishlistItem, Priority } from "@/store/types";
import { generateId } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters";
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
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";

const priorityVariant: Record<Priority, "nominal" | "caution" | "critical"> = {
  high: "critical",
  medium: "caution",
  low: "nominal",
};

interface Props {
  roomId: string;
  items: WishlistItem[];
}

export default function WishlistList({ roomId, items }: Props) {
  const addItem = useDobyStore((s) => s.addWishlistItem);
  const updateItem = useDobyStore((s) => s.updateWishlistItem);
  const deleteItem = useDobyStore((s) => s.deleteWishlistItem);
  const [editing, setEditing] = useState<WishlistItem | null>(null);
  const [open, setOpen] = useState(false);

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      price: Number(fd.get("price")) || 0,
      url: (fd.get("url") as string) || "",
      priority: (fd.get("priority") as Priority) || "medium",
      notes: (fd.get("notes") as string) || "",
    };

    if (editing) {
      updateItem(roomId, editing.id, data);
    } else {
      addItem(roomId, { id: generateId(), ...data });
    }
    setOpen(false);
  }

  const sorted = [...items].sort((a, b) => {
    const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm" className="gap-1.5" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus size={14} />
          <span>Add Item</span>
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState message="No wishlist items — add things you want for this room" />
      ) : (
        <div className="space-y-2">
          {sorted.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border border-border bg-surface p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-text-primary">{item.name}</p>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-azure hover:text-azure/80"
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-text-tertiary">
                  {item.price > 0 && <span>{formatCurrency(item.price)}</span>}
                  <StatusBadge label={item.priority} variant={priorityVariant[item.priority]} />
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => { setEditing(item); setOpen(true); }}
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
              {editing ? "Edit Wishlist Item" : "Add Wishlist Item"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Name</Label>
              <Input name="name" defaultValue={editing?.name ?? ""} required className="mt-1 border-border bg-surface text-text-primary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Price</Label>
                <Input name="price" type="number" step="0.01" defaultValue={editing?.price ?? ""} className="mt-1 border-border bg-surface text-text-primary" />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Priority</Label>
                <Select name="priority" defaultValue={editing?.priority ?? "medium"}>
                  <SelectTrigger className="mt-1 border-border bg-surface text-text-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-panel text-text-primary">
                    {(["high", "medium", "low"] as const).map((p) => (
                      <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">URL</Label>
              <Input name="url" type="url" defaultValue={editing?.url ?? ""} className="mt-1 border-border bg-surface text-text-primary" />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Notes</Label>
              <Textarea name="notes" defaultValue={editing?.notes ?? ""} className="mt-1 border-border bg-surface text-text-primary" rows={2} />
            </div>
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
