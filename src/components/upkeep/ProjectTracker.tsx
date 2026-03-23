"use client";

import { useState } from "react";
import { useDobyStore } from "@/store";
import type { Project, ProjectStatus } from "@/store/types";
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
import { Plus, Trash2 } from "lucide-react";

const statusVariant: Record<ProjectStatus, "nominal" | "caution" | "critical" | "neutral"> = {
  completed: "nominal",
  "in-progress": "caution",
  planned: "neutral",
  "on-hold": "critical",
};

export default function ProjectTracker() {
  const projects = useDobyStore((s) => s.projects);
  const addProject = useDobyStore((s) => s.addProject);
  const deleteProject = useDobyStore((s) => s.deleteProject);
  const [open, setOpen] = useState(false);

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addProject({
      id: generateId(),
      name: fd.get("name") as string,
      status: (fd.get("status") as ProjectStatus) || "planned",
      budget: Number(fd.get("budget")) || 0,
      actualSpend: Number(fd.get("actualSpend")) || 0,
      startDate: (fd.get("startDate") as string) || "",
      endDate: (fd.get("endDate") as string) || "",
      permitNumber: (fd.get("permitNumber") as string) || "",
      notes: (fd.get("notes") as string) || "",
    });
    setOpen(false);
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus size={14} />
          <span>Add Project</span>
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState message="No projects yet — plan renovations, repairs, improvements" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((p) => (
            <div key={p.id} className="border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-text-primary">{p.name}</span>
                <StatusBadge label={p.status} variant={statusVariant[p.status]} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-text-tertiary">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider">Budget</span>
                  {formatCurrency(p.budget)}
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider">Spent</span>
                  <span className={p.actualSpend > p.budget && p.budget > 0 ? "text-oxblood" : ""}>
                    {formatCurrency(p.actualSpend)}
                  </span>
                </div>
                {p.startDate && (
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider">Start</span>
                    {formatDate(p.startDate)}
                  </div>
                )}
                {p.endDate && (
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider">End</span>
                    {formatDate(p.endDate)}
                  </div>
                )}
              </div>
              {p.notes && (
                <p className="mt-2 text-[11px] text-text-tertiary">{p.notes}</p>
              )}
              <div className="mt-3 flex justify-end">
                <button onClick={() => deleteProject(p.id)} className="touch-target p-1 text-text-tertiary hover:text-oxblood">
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
            <DialogTitle className="text-sm font-bold uppercase tracking-wider">Add Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Name</Label>
              <Input name="name" required className="mt-1 border-border bg-surface text-text-primary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Status</Label>
                <Select name="status" defaultValue="planned">
                  <SelectTrigger className="mt-1 border-border bg-surface text-text-primary"><SelectValue /></SelectTrigger>
                  <SelectContent className="border-border bg-panel text-text-primary">
                    {(["planned", "in-progress", "completed", "on-hold"] as const).map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Budget</Label>
                <Input name="budget" type="number" className="mt-1 border-border bg-surface text-text-primary" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Start Date</Label>
                <Input name="startDate" type="date" className="mt-1 border-border bg-surface text-text-primary" />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">End Date</Label>
                <Input name="endDate" type="date" className="mt-1 border-border bg-surface text-text-primary" />
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
