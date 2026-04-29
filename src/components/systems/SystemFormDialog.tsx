"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useDobyStore } from "@/store";
import { systemPresets, systemCategories } from "@/store/defaults";
import { generateId } from "@/lib/constants";
import { fd as formData } from "@/lib/form";
import type { HomeSystem, Condition, SystemCategory } from "@/store/types";
import { Plus } from "lucide-react";

interface FieldConfig {
  name: keyof HomeSystem;
  label: string;
  type?: string;
  step?: string;
  placeholder?: string;
}

const categoryFields: Record<string, { title: string; fields: FieldConfig[] }> = {
  hvac: { title: "HVAC Details", fields: [
    { name: "filterSize", label: "Filter Size", placeholder: "e.g. 16x25x1" },
    { name: "filterChangeIntervalMonths", label: "Filter Change (Months)", type: "number" },
  ]},
  network: { title: "Service Details", fields: [
    { name: "provider", label: "Provider", placeholder: "e.g. Comcast, Verizon" },
    { name: "monthlyPayment", label: "Monthly Payment", type: "number", step: "0.01" },
    { name: "accountNumber", label: "Account Number" },
  ]},
  security: { title: "Security Service", fields: [
    { name: "provider", label: "Provider", placeholder: "e.g. ADT, Ring" },
    { name: "monthlyPayment", label: "Monthly Payment", type: "number", step: "0.01" },
    { name: "accountNumber", label: "Account Number" },
  ]},
  appliances: { title: "Appliance Details", fields: [
    { name: "brand", label: "Brand", placeholder: "e.g. Samsung, LG" },
    { name: "modelNumber", label: "Model Number" },
    { name: "serialNumber", label: "Serial Number" },
  ]},
  electrical: { title: "Electrical Details", fields: [
    { name: "amperage", label: "Amperage", type: "number", placeholder: "e.g. 200" },
    { name: "brand", label: "Brand" },
  ]},
  plumbing: { title: "Plumbing Details", fields: [
    { name: "capacity", label: "Capacity", placeholder: "e.g. 50 gallon" },
    { name: "brand", label: "Brand" },
    { name: "modelNumber", label: "Model Number" },
  ]},
  lighting: { title: "Lighting Details", fields: [
    { name: "brand", label: "Brand", placeholder: "e.g. Philips Hue, Lutron" },
    { name: "monthlyPayment", label: "Monthly Payment", type: "number", step: "0.01", placeholder: "If subscription" },
  ]},
};

interface Props {
  system?: HomeSystem;
  trigger?: React.ReactNode;
  onClose?: () => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

const inputCls = "border-border bg-surface text-text-primary";

export default function SystemFormDialog({ system, trigger, onClose }: Props) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<SystemCategory>(system?.category ?? "hvac");
  const [scope, setScope] = useState<"whole-home" | "room-specific">(system?.scope ?? "whole-home");
  const [name, setName] = useState(system?.name ?? "");
  const [lifeYears, setLifeYears] = useState<number | "">(system?.estimatedLifeYears ?? 15);
  const addSystem = useDobyStore((s) => s.addSystem);
  const updateSystem = useDobyStore((s) => s.updateSystem);
  const deleteSystem = useDobyStore((s) => s.deleteSystem);
  const rooms = useDobyStore((s) => s.rooms);
  const linkSystem = useDobyStore((s) => s.linkSystem);
  const unlinkSystem = useDobyStore((s) => s.unlinkSystem);
  const isEditing = !!system;

  // Track which rooms this system is assigned to (for room-specific)
  const [assignedRoomIds, setAssignedRoomIds] = useState<Set<string>>(() => {
    if (!system) return new Set<string>();
    return new Set(rooms.filter((r) => r.systemIds.includes(system.id)).map((r) => r.id));
  });

  function handleClose() {
    setOpen(false);
    onClose?.();
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = formData(new FormData(e.currentTarget));
    const data: Omit<HomeSystem, "id"> = {
      name: f.str("name"), icon: "settings-2", category, scope,
      installDate: f.str("installDate"), lastServiceDate: f.str("lastServiceDate"),
      nextServiceDate: f.str("nextServiceDate"), warrantyExpiration: f.str("warrantyExpiration"),
      estimatedLifeYears: f.num("estimatedLifeYears") || 15,
      estimatedReplaceCost: f.num("estimatedReplaceCost"),
      condition: (f.str("condition") as Condition) || "unknown",
      notes: f.str("notes"),
      filterSize: f.str("filterSize") || undefined,
      filterChangeIntervalMonths: f.num("filterChangeIntervalMonths") || undefined,
      provider: f.str("provider") || undefined, monthlyPayment: f.num("monthlyPayment") || undefined,
      accountNumber: f.str("accountNumber") || undefined, brand: f.str("brand") || undefined,
      modelNumber: f.str("modelNumber") || undefined, serialNumber: f.str("serialNumber") || undefined,
      amperage: f.num("amperage") || undefined, capacity: f.str("capacity") || undefined,
    };

    if (isEditing) {
      updateSystem(system.id, data);
      // Sync room assignments for room-specific systems
      if (scope === "room-specific") {
        const currentRoomIds = new Set(rooms.filter((r) => r.systemIds.includes(system.id)).map((r) => r.id));
        // Unlink rooms that were removed
        for (const rid of currentRoomIds) {
          if (!assignedRoomIds.has(rid)) unlinkSystem(rid, system.id);
        }
        // Link new rooms
        for (const rid of assignedRoomIds) {
          if (!currentRoomIds.has(rid)) linkSystem(rid, system.id);
        }
      } else {
        // Switching to whole-home — unlink from all rooms (no longer needed)
        for (const r of rooms) {
          if (r.systemIds.includes(system.id)) unlinkSystem(r.id, system.id);
        }
      }
    } else {
      const newId = generateId();
      addSystem({ id: newId, ...data });
      // Assign to selected rooms
      if (scope === "room-specific") {
        for (const rid of assignedRoomIds) {
          linkSystem(rid, newId);
        }
      }
    }
    handleClose();
  }

  function handleDelete() {
    if (system) { deleteSystem(system.id); handleClose(); }
  }

  function applyPreset(presetName: string) {
    const preset = systemPresets.find((p) => p.name === presetName);
    if (!preset) return;
    setCategory(preset.category);
    setScope(preset.scope);
    setName(preset.name);
    setLifeYears(preset.estimatedLifeYears);
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
              <button key={p.name} type="button" onClick={() => applyPreset(p.name)}
                className="border border-border px-3 py-2 text-[11px] text-text-secondary hover:border-azure hover:text-azure transition-colors">
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <form id="system-form" onSubmit={handleSave} className="space-y-4">
        {/* Name + Category */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name">
            <Input name="name" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
          </Field>
          <Field label="Category">
            <Select value={category} onValueChange={(v) => setCategory(v as SystemCategory)}>
              <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
              <SelectContent className="border-border bg-panel text-text-primary">
                {systemCategories.map((c) => (
                  <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        {/* Scope */}
        <Field label="Scope">
          <div className="flex gap-2">
            <button type="button" onClick={() => setScope("whole-home")}
              className={`flex-1 border px-3 py-2 text-[11px] transition-colors ${scope === "whole-home" ? "border-azure bg-azure/10 text-azure" : "border-border text-text-secondary"}`}>
              Whole Home
            </button>
            <button type="button" onClick={() => setScope("room-specific")}
              className={`flex-1 border px-3 py-2 text-[11px] transition-colors ${scope === "room-specific" ? "border-azure bg-azure/10 text-azure" : "border-border text-text-secondary"}`}>
              Room-Specific
            </button>
          </div>
        </Field>

        {/* Room assignment (only for room-specific) */}
        {scope === "room-specific" && rooms.length > 0 && (
          <Field label="Assign to Rooms">
            <div className="flex flex-wrap gap-2 mt-1">
              {rooms.map((r) => {
                const checked = assignedRoomIds.has(r.id);
                return (
                  <label key={r.id} className={`flex items-center gap-1.5 border px-2.5 py-1.5 text-[11px] cursor-pointer transition-colors ${checked ? "border-azure bg-azure/10 text-azure" : "border-border text-text-secondary hover:border-text-tertiary"}`}>
                    <input type="checkbox" checked={checked} className="accent-azure"
                      onChange={(e) => {
                        setAssignedRoomIds((prev) => {
                          const next = new Set(prev);
                          e.target.checked ? next.add(r.id) : next.delete(r.id);
                          return next;
                        });
                      }} />
                    {r.name}
                  </label>
                );
              })}
            </div>
          </Field>
        )}

        {/* Common dates */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Install Date">
            <Input name="installDate" type="date" defaultValue={system?.installDate ?? ""} className={inputCls} />
          </Field>
          <Field label="Last Service">
            <Input name="lastServiceDate" type="date" defaultValue={system?.lastServiceDate ?? ""} className={inputCls} />
          </Field>
          <Field label="Next Service">
            <Input name="nextServiceDate" type="date" defaultValue={system?.nextServiceDate ?? ""} className={inputCls} />
          </Field>
          <Field label="Warranty Expires">
            <Input name="warrantyExpiration" type="date" defaultValue={system?.warrantyExpiration ?? ""} className={inputCls} />
          </Field>
        </div>

        {/* Common specs */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Lifespan (Years)">
            <Input
              name="estimatedLifeYears"
              type="number"
              value={lifeYears}
              onChange={(e) => setLifeYears(e.target.value === "" ? "" : Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="Replace Cost">
            <Input name="estimatedReplaceCost" type="number" defaultValue={system?.estimatedReplaceCost ?? ""} className={inputCls} />
          </Field>
        </div>

        <Field label="Condition">
          <Select name="condition" defaultValue={system?.condition ?? "unknown"}>
            <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
            <SelectContent className="border-border bg-panel text-text-primary">
              {(["excellent", "good", "fair", "poor", "unknown"] as const).map((c) => (
                <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* ─── Category-specific fields ─── */}
        {category && categoryFields[category] && (() => {
          const { title, fields } = categoryFields[category];
          const val = (name: keyof HomeSystem) => (system ? String(system[name] ?? "") : "");
          const renderField = (f: FieldConfig) => (
            <Field key={f.name} label={f.label}>
              <Input name={f.name} type={f.type || "text"} step={f.step} defaultValue={val(f.name)} className={inputCls} placeholder={f.placeholder} />
            </Field>
          );
          return (
            <>
              <div className="border-t border-border pt-4">
                <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-azure">{title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">{fields.slice(0, 2).map(renderField)}</div>
              {fields.slice(2).map(renderField)}
            </>
          );
        })()}

        {/* Notes — always shown */}
        <Field label="Notes">
          <Textarea name="notes" defaultValue={system?.notes ?? ""} className={`${inputCls} mt-0`} rows={2} />
        </Field>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          {isEditing ? (
            <Button type="button" variant="outline" size="sm" onClick={handleDelete} className="border-oxblood text-oxblood hover:bg-oxblood-dim">
              Delete
            </Button>
          ) : <div />}
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
