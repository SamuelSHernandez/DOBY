"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useDobyStore } from "@/store";
import { systemPresets } from "@/store/defaults";
import { generateId } from "@/lib/constants";
import type { HomeSystem, Condition, SystemCategory } from "@/store/types";
import { Plus } from "lucide-react";

interface Props {
  system?: HomeSystem;
  trigger?: React.ReactNode;
  onClose?: () => void;
}

export default function SystemFormDialog({ system, trigger, onClose }: Props) {
  const [open, setOpen] = useState(false);
  const addSystem = useDobyStore((s) => s.addSystem);
  const updateSystem = useDobyStore((s) => s.updateSystem);
  const deleteSystem = useDobyStore((s) => s.deleteSystem);
  const isEditing = !!system;

  function handleClose() {
    setOpen(false);
    onClose?.();
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      icon: "settings-2",
      category: (fd.get("category") as SystemCategory) || "hvac",
      installDate: (fd.get("installDate") as string) || "",
      lastServiceDate: (fd.get("lastServiceDate") as string) || "",
      nextServiceDate: (fd.get("nextServiceDate") as string) || "",
      warrantyExpiration: (fd.get("warrantyExpiration") as string) || "",
      estimatedLifeYears: Number(fd.get("estimatedLifeYears")) || 15,
      estimatedReplaceCost: Number(fd.get("estimatedReplaceCost")) || 0,
      condition: (fd.get("condition") as Condition) || "unknown",
      notes: (fd.get("notes") as string) || "",
      filterSize: (fd.get("filterSize") as string) || undefined,
      filterChangeIntervalMonths: Number(fd.get("filterChangeIntervalMonths")) || undefined,
    };

    if (isEditing) {
      updateSystem(system.id, data);
    } else {
      addSystem({ id: generateId(), ...data });
    }
    handleClose();
  }

  function handleDelete() {
    if (system) {
      deleteSystem(system.id);
      handleClose();
    }
  }

  function applyPreset(name: string) {
    const preset = systemPresets.find((p) => p.name === name);
    if (preset) {
      const form = document.querySelector<HTMLFormElement>("#system-form");
      if (form) {
        const nameInput = form.querySelector<HTMLInputElement>('[name="name"]');
        const lifeInput = form.querySelector<HTMLInputElement>('[name="estimatedLifeYears"]');
        if (nameInput) nameInput.value = preset.name;
        if (lifeInput) lifeInput.value = String(preset.estimatedLifeYears);
      }
    }
  }

  const content = (
    <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-panel text-text-primary sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="text-sm font-bold uppercase tracking-wider">
          {isEditing ? "Edit System" : "Add System"}
        </DialogTitle>
      </DialogHeader>

      {!isEditing && (
        <div className="mb-4">
          <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Quick Select</Label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {systemPresets.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p.name)}
                className="border border-border px-3 py-2 text-[11px] text-text-secondary hover:border-azure hover:text-azure transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <form id="system-form" onSubmit={handleSave} className="space-y-4">
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Name</Label>
          <Input name="name" defaultValue={system?.name ?? ""} required className="mt-1 border-border bg-surface text-text-primary" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Install Date</Label>
            <Input name="installDate" type="date" defaultValue={system?.installDate ?? ""} className="mt-1 border-border bg-surface text-text-primary" />
          </div>
          <div>
            <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Last Service</Label>
            <Input name="lastServiceDate" type="date" defaultValue={system?.lastServiceDate ?? ""} className="mt-1 border-border bg-surface text-text-primary" />
          </div>
          <div>
            <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Next Service</Label>
            <Input name="nextServiceDate" type="date" defaultValue={system?.nextServiceDate ?? ""} className="mt-1 border-border bg-surface text-text-primary" />
          </div>
          <div>
            <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Warranty Expires</Label>
            <Input name="warrantyExpiration" type="date" defaultValue={system?.warrantyExpiration ?? ""} className="mt-1 border-border bg-surface text-text-primary" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Lifespan (Years)</Label>
            <Input name="estimatedLifeYears" type="number" defaultValue={system?.estimatedLifeYears ?? 15} className="mt-1 border-border bg-surface text-text-primary" />
          </div>
          <div>
            <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Replace Cost</Label>
            <Input name="estimatedReplaceCost" type="number" defaultValue={system?.estimatedReplaceCost ?? ""} className="mt-1 border-border bg-surface text-text-primary" />
          </div>
        </div>

        <div>
          <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Condition</Label>
          <Select name="condition" defaultValue={system?.condition ?? "unknown"}>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Filter Size</Label>
            <Input name="filterSize" defaultValue={system?.filterSize ?? ""} className="mt-1 border-border bg-surface text-text-primary" placeholder="e.g. 16x25x1" />
          </div>
          <div>
            <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Filter Change (Months)</Label>
            <Input name="filterChangeIntervalMonths" type="number" defaultValue={system?.filterChangeIntervalMonths ?? ""} className="mt-1 border-border bg-surface text-text-primary" />
          </div>
        </div>

        <div>
          <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Notes</Label>
          <Textarea name="notes" defaultValue={system?.notes ?? ""} className="mt-1 border-border bg-surface text-text-primary" rows={2} />
        </div>

        <div className="flex items-center justify-between pt-2">
          {isEditing ? (
            <Button type="button" variant="outline" size="sm" onClick={handleDelete} className="border-oxblood text-oxblood hover:bg-oxblood-dim">
              Delete
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleClose} className="border-border text-text-secondary">Cancel</Button>
            <Button type="submit" size="sm">{isEditing ? "Save" : "Add System"}</Button>
          </div>
        </div>
      </form>
    </DialogContent>
  );

  if (system) {
    return (
      <Dialog open={true} onOpenChange={(v) => !v && handleClose()}>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-1.5">
            <Plus size={14} />
            <span>Add System</span>
          </Button>
        )}
      </DialogTrigger>
      {content}
    </Dialog>
  );
}
