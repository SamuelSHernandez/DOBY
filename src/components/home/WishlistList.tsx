"use client";

import { useState, useRef } from "react";
import { useDobyStore } from "@/store";
import type { WishlistItem, Priority } from "@/store/types";
import { toast } from "sonner";
import { generateId } from "@/lib/constants";
import { fd as formData } from "@/lib/form";
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
import { Plus, Pencil, Trash2, ShoppingCart, ExternalLink } from "lucide-react";

// Instant vendor detection from URL — no network call needed
const VENDOR_HOSTS: Record<string, string> = {
  "amazon.com": "Amazon",
  "ikea.com": "IKEA",
  "target.com": "Target",
  "walmart.com": "Walmart",
  "homedepot.com": "Home Depot",
  "lowes.com": "Lowe's",
  "wayfair.com": "Wayfair",
  "costco.com": "Costco",
  "etsy.com": "Etsy",
  "cb2.com": "CB2",
  "crateandbarrel.com": "Crate & Barrel",
  "potterybarn.com": "Pottery Barn",
  "westelm.com": "West Elm",
  "overstock.com": "Overstock",
  "bedbathandbeyond.com": "Bed Bath & Beyond",
  "acehardware.com": "Ace Hardware",
  "menards.com": "Menards",
  "rejuvenation.com": "Rejuvenation",
  "restorationhardware.com": "RH",
  "rh.com": "RH",
  "pier1.com": "Pier 1",
  "worldmarket.com": "World Market",
  "zgallerie.com": "Z Gallerie",
  "anthropologie.com": "Anthropologie",
  "urbanoutfitters.com": "Urban Outfitters",
  "allmodern.com": "AllModern",
  "jossandmain.com": "Joss & Main",
  "birchlane.com": "Birch Lane",
  "hayneedle.com": "Hayneedle",
  "build.com": "Build.com",
  "fergusons.com": "Ferguson",
  "lumens.com": "Lumens",
  "ylighting.com": "YLighting",
  "ebay.com": "eBay",
  "bestbuy.com": "Best Buy",
  "samsclub.com": "Sam's Club",
};

function vendorFromUrl(url: string): string | null {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "").replace(/^smile\./, "");
    // Direct match
    if (VENDOR_HOSTS[hostname]) return VENDOR_HOSTS[hostname];
    // Try without subdomain (e.g., m.ikea.com)
    const parts = hostname.split(".");
    const domain = parts.slice(-2).join(".");
    return VENDOR_HOSTS[domain] || null;
  } catch {
    return null;
  }
}

const priorityColor: Record<Priority, string> = {
  high: "text-oxblood",
  medium: "text-saffron",
  low: "text-text-tertiary",
};

type SortKey = "priority" | "price" | "vendor" | "name";
type SortDir = "asc" | "desc";

interface Props {
  roomId: string;
  items: WishlistItem[];
}

export default function WishlistList({ roomId, items }: Props) {
  const addItem = useDobyStore((s) => s.addWishlistItem);
  const updateItem = useDobyStore((s) => s.updateWishlistItem);
  const deleteItem = useDobyStore((s) => s.deleteWishlistItem);
  const purchaseItem = useDobyStore((s) => s.purchaseWishlistItem);
  const [editing, setEditing] = useState<WishlistItem | null>(null);
  const [open, setOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("priority");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filterVendor, setFilterVendor] = useState("");
  // Refs for auto-fill from URL
  const vendorRef = useRef<HTMLInputElement>(null);

  function toggleSort(key: SortKey) {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir(key === "price" ? "desc" : "asc");
    }
  }

  // Extract vendor instantly from URL
  function onUrlChange(url: string) {
    if (!url) return;
    const vendor = vendorFromUrl(url);
    if (vendor && vendorRef.current && !vendorRef.current.value) {
      vendorRef.current.value = vendor;
    }
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = formData(new FormData(e.currentTarget));
    const data = {
      name: f.str("name"), price: f.num("price"), url: f.url("url"),
      priority: (f.str("priority") as Priority) || "medium",
      notes: f.str("notes"), imageUrl: editing?.imageUrl || "", vendor: f.str("vendor"),
    };

    if (editing) {
      updateItem(roomId, editing.id, data);
    } else {
      addItem(roomId, { id: generateId(), ...data });
    }
    setOpen(false);
    setEditing(null);
  }

  // Derive vendor for each item: explicit vendor > parsed from URL
  function getVendor(item: WishlistItem): string {
    if (item.vendor) return item.vendor;
    if (item.url) return vendorFromUrl(item.url) || "";
    return "";
  }

  const allVendors = [...new Set(items.map((i) => getVendor(i)).filter(Boolean))].sort();

  let filtered = filterVendor ? items.filter((i) => getVendor(i) === filterVendor) : [...items];

  const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
  const dir = sortDir === "asc" ? 1 : -1;
  filtered.sort((a, b) => {
    if (sortBy === "priority") return (priorityOrder[a.priority] - priorityOrder[b.priority]) * dir;
    if (sortBy === "price") return (a.price - b.price) * dir;
    if (sortBy === "vendor") return getVendor(a).localeCompare(getVendor(b)) * dir;
    if (sortBy === "name") return a.name.localeCompare(b.name) * dir;
    return 0;
  });

  const arrow = sortDir === "asc" ? "\u2191" : "\u2193";

  return (
    <div>
      {/* Controls */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {(["priority", "price", "vendor", "name"] as const).map((key) => (
          <button
            key={key}
            onClick={() => toggleSort(key)}
            className={`border px-2 py-1 text-[10px] uppercase tracking-wider transition-colors ${
              sortBy === key
                ? "border-azure bg-azure/10 text-azure"
                : "border-border text-text-tertiary hover:text-text-secondary"
            }`}
          >
            {key}{sortBy === key && ` ${arrow}`}
          </button>
        ))}

        {allVendors.length > 0 && (
          <select
            value={filterVendor}
            onChange={(e) => setFilterVendor(e.target.value)}
            style={{ fontSize: 10, height: 26, lineHeight: "26px" }}
            className="border border-border bg-transparent px-2 uppercase tracking-wider text-text-tertiary outline-none"
          >
            <option value="">All vendors</option>
            {allVendors.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        )}

        <div className="ml-auto">
          <Button size="sm" className="gap-1.5" onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus size={14} />
            <span>Add</span>
          </Button>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState message={items.length === 0 ? "No wishlist items — add things you want for this room" : "No items match filter"} />
      ) : (
        <div className="space-y-1">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 border border-border bg-surface px-3 py-2"
            >
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.name} referrerPolicy="no-referrer" className="h-10 w-10 shrink-0 rounded object-cover bg-carbon" />
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm text-text-primary truncate">{item.name}</p>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-azure hover:text-azure/80">
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  {item.price > 0 && <span className="text-text-secondary">{formatCurrency(item.price)}</span>}
                  {getVendor(item) && <span className="text-text-tertiary">{getVendor(item)}</span>}
                  <span className={`uppercase text-[10px] font-semibold ${priorityColor[item.priority]}`}>
                    {item.priority}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => { purchaseItem(roomId, item.id); toast.success(`"${item.name}" moved to inventory`); }}
                  className="touch-target flex items-center gap-1 rounded px-2 py-1 text-[10px] text-sea-green hover:bg-sea-green/10"
                  title="Mark as purchased — moves to inventory"
                >
                  <ShoppingCart size={12} />
                  <span className="hidden sm:inline">Bought</span>
                </button>
                <button
                  onClick={() => { setEditing(item); setOpen(true); }}
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

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
        <DialogContent className="border-border bg-panel text-text-primary sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-wider">
              {editing ? "Edit Item" : "Add to Wishlist"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            {/* Product URL first — paste to auto-fill */}
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">
                Product URL
              </Label>
              <Input
                name="url"
                type="url"
                defaultValue={editing?.url ?? ""}
                className="mt-1 border-border bg-surface text-text-primary"
                placeholder="Paste link — auto-fills vendor & image"
                onBlur={(e) => { if (e.target.value && !editing) onUrlChange(e.target.value); }}
              />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Name</Label>
              <Input name="name" defaultValue={editing?.name ?? ""} required className="mt-1 border-border bg-surface text-text-primary" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Price</Label>
                <Input name="price" type="number" step="0.01" defaultValue={editing?.price ?? ""} className="mt-1 border-border bg-surface text-text-primary" />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Vendor</Label>
                <Input ref={vendorRef} name="vendor" defaultValue={editing?.vendor ?? ""} className="mt-1 border-border bg-surface text-text-primary" placeholder="Auto or type" />
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
              <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Notes</Label>
              <Textarea name="notes" defaultValue={editing?.notes ?? ""} className="mt-1 border-border bg-surface text-text-primary" rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => { setOpen(false); setEditing(null); }} className="border-border text-text-secondary">Cancel</Button>
              <Button type="submit" size="sm">{editing ? "Save" : "Add"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
