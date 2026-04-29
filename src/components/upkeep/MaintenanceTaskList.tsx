"use client";

import { useState } from "react";
import { useDobyStore } from "@/store";
import { useShallow } from "zustand/react/shallow";
import { daysUntil, daysUntilAfterMonths, toISODate } from "@/lib/dates";
import { formatDueText } from "@/lib/form";
import { generateId } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DisplayTask {
  /** React list key — globally unique across sources */
  key: string;
  /** Identity of the underlying domain object (system id, project id, custom-task id) */
  realId: string;
  name: string;
  location: string;
  daysAway: number;
  dueText: string;
  priority: "high" | "medium" | "low";
  source: "system" | "filter" | "project" | "custom";
  completed: boolean;
}

export default function MaintenanceTaskList() {
  const { systems, rooms, projects, customTasks } = useDobyStore(useShallow((s) => ({
    systems: s.systems, rooms: s.rooms,
    projects: s.projects, customTasks: s.customTasks,
  })));
  const completeSystemService = useDobyStore((s) => s.completeSystemService);
  const completeCustomTask = useDobyStore((s) => s.completeCustomTask);
  const addCustomTask = useDobyStore((s) => s.addCustomTask);
  const deleteCustomTask = useDobyStore((s) => s.deleteCustomTask);

  const [addOpen, setAddOpen] = useState(false);

  const tasks: DisplayTask[] = [];

  // System service dates
  for (const sys of systems) {
    if (sys.nextServiceDate) {
      const days = daysUntil(sys.nextServiceDate);
      const room = rooms.find((r) => r.systemIds.includes(sys.id));

      tasks.push({
        key: `sys-${sys.id}`,
        realId: sys.id,
        name: `${sys.name} service`,
        location: room?.name ?? "Whole home",
        daysAway: days,
        dueText: formatDueText(days),
        priority: days < 0 ? "high" : days < 30 ? "medium" : "low",
        source: "system",
        completed: false,
      });
    }

    // Filter changes
    if (sys.filterSize && sys.filterChangeIntervalMonths && sys.lastServiceDate) {
      const daysRemaining = daysUntilAfterMonths(sys.lastServiceDate, sys.filterChangeIntervalMonths);
      if (daysRemaining < 60) {
        const room = rooms.find((r) => r.systemIds.includes(sys.id));
        tasks.push({
          key: `filter-${sys.id}`,
          realId: sys.id,
          name: `Replace ${sys.name} filter`,
          location: room?.name ?? "Whole home",
          daysAway: daysRemaining,
          dueText: formatDueText(daysRemaining),
          priority: daysRemaining < 0 ? "high" : daysRemaining < 14 ? "medium" : "low",
          source: "filter",
          completed: false,
        });
      }
    }
  }

  // Active projects
  for (const proj of projects) {
    if (proj.status === "in-progress" || proj.status === "planned") {
      if (proj.endDate) {
        const days = daysUntil(proj.endDate);
        tasks.push({
          key: `proj-${proj.id}`,
          realId: proj.id,
          name: proj.name,
          location: "Project",
          daysAway: days,
          dueText: formatDueText(days),
          priority: days < 0 ? "high" : "medium",
          source: "project",
          completed: false,
        });
      }
    }
  }

  // Custom tasks (incomplete only)
  for (const task of customTasks) {
    if (task.completed) continue;
    const days = task.dueDate ? daysUntil(task.dueDate) : 999;
    tasks.push({
      key: `custom-${task.id}`,
      realId: task.id,
      name: task.name,
      location: task.location,
      daysAway: days,
      dueText: task.dueDate ? formatDueText(days) : "No due date",
      priority: task.priority,
      source: "custom",
      completed: false,
    });
  }

  const sorted = [...tasks].sort((a, b) => a.daysAway - b.daysAway);

  const borderColors = { high: "border-l-oxblood", medium: "border-l-saffron", low: "border-l-azure" };
  const badgeColors = { high: "border-oxblood text-oxblood", medium: "border-saffron text-saffron", low: "border-azure text-azure" };
  const dueColors = { high: "text-oxblood", medium: "text-saffron", low: "text-text-tertiary" };

  function handleComplete(task: DisplayTask) {
    if (task.source === "system" || task.source === "filter") {
      completeSystemService(task.realId);
      toast.success(`${task.name} marked complete — next service date updated`);
    } else if (task.source === "custom") {
      completeCustomTask(task.realId);
      toast.success(`${task.name} completed`);
    }
  }

  function handleDelete(task: DisplayTask) {
    if (task.source === "custom") {
      deleteCustomTask(task.realId);
      toast.success("Task removed");
    }
  }

  function handleAddTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addCustomTask({
      id: generateId(),
      name: fd.get("name") as string,
      location: (fd.get("location") as string) || "Whole home",
      dueDate: (fd.get("dueDate") as string) || "",
      priority: (fd.get("priority") as "high" | "medium" | "low") || "medium",
      completed: false,
    });
    setAddOpen(false);
    toast.success("Task added");
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
          <Plus size={14} />
          <span>Add Task</span>
        </Button>
      </div>

      {sorted.length === 0 ? (
        <p className="py-8 text-sm text-text-tertiary">No maintenance tasks. Add systems with service dates or create custom tasks.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((task) => (
            <div
              key={task.key}
              className={cn("flex items-center gap-3 border border-border border-l-[3px] bg-surface px-4 py-4", borderColors[task.priority])}
            >
              {/* Checkbox */}
              <Checkbox
                checked={false}
                onCheckedChange={() => handleComplete(task)}
                className="shrink-0"
              />

              {/* Task info */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">{task.name}</p>
                <p className="mt-0.5 text-[11px] text-text-tertiary">{task.location}</p>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-3">
                <span className={cn("text-xs", dueColors[task.priority])}>{task.dueText}</span>
                <span className={cn("border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", badgeColors[task.priority])}>
                  {task.priority}
                </span>
                {task.source === "custom" && (
                  <button
                    onClick={() => handleDelete(task)}
                    className="touch-target p-2 text-text-tertiary hover:text-oxblood"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="border-border bg-panel text-text-primary sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-wider">Add Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Task Name</Label>
              <Input name="name" required className="mt-1 border-border bg-surface text-text-primary" placeholder="e.g. Clean gutters" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Location</Label>
                <Input name="location" defaultValue="Whole home" className="mt-1 border-border bg-surface text-text-primary" />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Due Date</Label>
                <Input name="dueDate" type="date" defaultValue={toISODate(new Date())} className="mt-1 border-border bg-surface text-text-primary" />
              </div>
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Priority</Label>
              <Select name="priority" defaultValue="medium">
                <SelectTrigger className="mt-1 border-border bg-surface text-text-primary"><SelectValue /></SelectTrigger>
                <SelectContent className="border-border bg-panel text-text-primary">
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAddOpen(false)} className="border-border text-text-secondary">Cancel</Button>
              <Button type="submit" size="sm">Add Task</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
