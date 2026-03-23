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
import type { HomeSystem, Condition, SystemCategory } from "@/store/types";
import { Plus } from "lucide-react";

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
    const data: Omit<HomeSystem, "id"> = {
      name: fd.get("name") as string,
      icon: "settings-2",
      category,
      installDate: (fd.get("installDate") as string) || "",
      lastServiceDate: (fd.get("lastServiceDate") as string) || "",
      nextServiceDate: (fd.get("nextServiceDate") as string) || "",
      warrantyExpiration: (fd.get("warrantyExpiration") as string) || "",
      estimatedLifeYears: Number(fd.get("estimatedLifeYears")) || 15,
      estimatedReplaceCost: Number(fd.get("estimatedReplaceCost")) || 0,
      condition: (fd.get("condition") as Condition) || "unknown",
      notes: (fd.get("notes") as string) || "",
      // Category-specific
      filterSize: (fd.get("filterSize") as string) || undefined,
      filterChangeIntervalMonths: Number(fd.get("filterChangeIntervalMonths")) || undefined,
      provider: (fd.get("provider") as string) || undefined,
      monthlyPayment: Number(fd.get("monthlyPayment")) || undefined,
      accountNumber: (fd.get("accountNumber") as string) || undefined,
      brand: (fd.get("brand") as string) || undefined,
      modelNumber: (fd.get("modelNumber") as string) || undefined,
      serialNumber: (fd.get("serialNumber") as string) || undefined,
      amperage: Number(fd.get("amperage")) || undefined,
      capacity: (fd.get("capacity") as string) || undefined,
    };

    if (isEditing) {
      updateSystem(system.id, data);
    } else {
      addSystem({ id: generateId(), ...data });
    }
    handleClose();
  }

  function handleDelete() {
    if (system) { deleteSystem(system.id); handleClose(); }
  }

  function applyPreset(name: string) {
    const preset = systemPresets.find((p) => p.name === name);
    if (preset) {
      setCategory(preset.category);
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
            <Input name="name" defaultValue={system?.name ?? ""} required className={inputCls} />
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
            <Input name="estimatedLifeYears" type="number" defaultValue={system?.estimatedLifeYears ?? 15} className={inputCls} />
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

        {/* HVAC: filter info */}
        {category === "hvac" && (
          <>
            <div className="border-t border-border pt-4">
              <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-azure">HVAC Details</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Filter Size">
                <Input name="filterSize" defaultValue={system?.filterSize ?? ""} className={inputCls} placeholder="e.g. 16x25x1" />
              </Field>
              <Field label="Filter Change (Months)">
                <Input name="filterChangeIntervalMonths" type="number" defaultValue={system?.filterChangeIntervalMonths ?? ""} className={inputCls} />
              </Field>
            </div>
          </>
        )}

        {/* Network: provider, monthly payment, account */}
        {category === "network" && (
          <>
            <div className="border-t border-border pt-4">
              <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-azure">Service Details</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Provider">
                <Input name="provider" defaultValue={system?.provider ?? ""} className={inputCls} placeholder="e.g. Comcast, Verizon" />
              </Field>
              <Field label="Monthly Payment">
                <Input name="monthlyPayment" type="number" step="0.01" defaultValue={system?.monthlyPayment ?? ""} className={inputCls} />
              </Field>
            </div>
            <Field label="Account Number">
              <Input name="accountNumber" defaultValue={system?.accountNumber ?? ""} className={inputCls} />
            </Field>
          </>
        )}

        {/* Security: provider, monthly payment, account */}
        {category === "security" && (
          <>
            <div className="border-t border-border pt-4">
              <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-azure">Security Service</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Provider">
                <Input name="provider" defaultValue={system?.provider ?? ""} className={inputCls} placeholder="e.g. ADT, Ring" />
              </Field>
              <Field label="Monthly Payment">
                <Input name="monthlyPayment" type="number" step="0.01" defaultValue={system?.monthlyPayment ?? ""} className={inputCls} />
              </Field>
            </div>
            <Field label="Account Number">
              <Input name="accountNumber" defaultValue={system?.accountNumber ?? ""} className={inputCls} />
            </Field>
          </>
        )}

        {/* Appliances: brand, model, serial */}
        {category === "appliances" && (
          <>
            <div className="border-t border-border pt-4">
              <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-azure">Appliance Details</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Brand">
                <Input name="brand" defaultValue={system?.brand ?? ""} className={inputCls} placeholder="e.g. Samsung, LG" />
              </Field>
              <Field label="Model Number">
                <Input name="modelNumber" defaultValue={system?.modelNumber ?? ""} className={inputCls} />
              </Field>
            </div>
            <Field label="Serial Number">
              <Input name="serialNumber" defaultValue={system?.serialNumber ?? ""} className={inputCls} />
            </Field>
          </>
        )}

        {/* Electrical: amperage, brand */}
        {category === "electrical" && (
          <>
            <div className="border-t border-border pt-4">
              <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-azure">Electrical Details</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Amperage">
                <Input name="amperage" type="number" defaultValue={system?.amperage ?? ""} className={inputCls} placeholder="e.g. 200" />
              </Field>
              <Field label="Brand">
                <Input name="brand" defaultValue={system?.brand ?? ""} className={inputCls} />
              </Field>
            </div>
          </>
        )}

        {/* Plumbing: capacity, brand */}
        {category === "plumbing" && (
          <>
            <div className="border-t border-border pt-4">
              <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-azure">Plumbing Details</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Capacity">
                <Input name="capacity" defaultValue={system?.capacity ?? ""} className={inputCls} placeholder="e.g. 50 gallon" />
              </Field>
              <Field label="Brand">
                <Input name="brand" defaultValue={system?.brand ?? ""} className={inputCls} />
              </Field>
            </div>
            <Field label="Model Number">
              <Input name="modelNumber" defaultValue={system?.modelNumber ?? ""} className={inputCls} />
            </Field>
          </>
        )}

        {/* Lighting: brand, monthly payment (if smart lighting service) */}
        {category === "lighting" && (
          <>
            <div className="border-t border-border pt-4">
              <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-azure">Lighting Details</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Brand">
                <Input name="brand" defaultValue={system?.brand ?? ""} className={inputCls} placeholder="e.g. Philips Hue, Lutron" />
              </Field>
              <Field label="Monthly Payment">
                <Input name="monthlyPayment" type="number" step="0.01" defaultValue={system?.monthlyPayment ?? ""} className={inputCls} placeholder="If subscription" />
              </Field>
            </div>
          </>
        )}

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
