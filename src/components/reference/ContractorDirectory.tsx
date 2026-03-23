"use client";

import { useState } from "react";
import { useDobyStore } from "@/store";
import { contractorTypes } from "@/store/defaults";
import { generateId } from "@/lib/constants";
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
import { Plus, Trash2, Phone, Mail, Star } from "lucide-react";

export default function ContractorDirectory() {
  const contractors = useDobyStore((s) => s.contractors);
  const addContractor = useDobyStore((s) => s.addContractor);
  const deleteContractor = useDobyStore((s) => s.deleteContractor);
  const [open, setOpen] = useState(false);

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addContractor({
      id: generateId(),
      name: fd.get("name") as string,
      type: fd.get("type") as string,
      phone: (fd.get("phone") as string) || "",
      email: (fd.get("email") as string) || "",
      rating: Number(fd.get("rating")) || 0,
      lastUsedDate: (fd.get("lastUsedDate") as string) || "",
      notes: (fd.get("notes") as string) || "",
    });
    setOpen(false);
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus size={14} />
          <span>Add Contractor</span>
        </Button>
      </div>

      {contractors.length === 0 ? (
        <EmptyState message="No contractors saved — add plumbers, electricians, handymen" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {contractors.map((c) => (
            <div key={c.id} className="border border-border bg-surface p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{c.name}</p>
                  <p className="text-[11px] text-text-tertiary">{c.type}</p>
                </div>
                <button onClick={() => deleteContractor(c.id)} className="touch-target p-1 text-text-tertiary hover:text-oxblood">
                  <Trash2 size={14} />
                </button>
              </div>
              {c.rating > 0 && (
                <div className="mt-2 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={i < c.rating ? "fill-saffron text-saffron" : "text-border"}
                    />
                  ))}
                </div>
              )}
              <div className="mt-3 space-y-1">
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-[11px] text-azure hover:underline">
                    <Phone size={12} /> {c.phone}
                  </a>
                )}
                {c.email && (
                  <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-[11px] text-azure hover:underline">
                    <Mail size={12} /> {c.email}
                  </a>
                )}
              </div>
              {c.notes && (
                <p className="mt-2 text-[11px] text-text-tertiary">{c.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-panel text-text-primary sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-wider">Add Contractor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Name</Label>
              <Input name="name" required className="mt-1 border-border bg-surface text-text-primary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Type</Label>
                <Select name="type" defaultValue="General">
                  <SelectTrigger className="mt-1 border-border bg-surface text-text-primary"><SelectValue /></SelectTrigger>
                  <SelectContent className="border-border bg-panel text-text-primary">
                    {contractorTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Rating (1-5)</Label>
                <Input name="rating" type="number" min="0" max="5" className="mt-1 border-border bg-surface text-text-primary" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Phone</Label>
                <Input name="phone" type="tel" className="mt-1 border-border bg-surface text-text-primary" />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Email</Label>
                <Input name="email" type="email" className="mt-1 border-border bg-surface text-text-primary" />
              </div>
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Notes</Label>
              <Textarea name="notes" className="mt-1 border-border bg-surface text-text-primary" rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} className="border-border text-text-secondary">Cancel</Button>
              <Button type="submit" size="sm">Add</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
