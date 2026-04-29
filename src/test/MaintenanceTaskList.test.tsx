import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import MaintenanceTaskList from "@/components/upkeep/MaintenanceTaskList";
import { useDobyStore } from "@/store";
import { defaultMaterials } from "@/store/defaults";
import { addDays } from "date-fns";

function iso(date: Date) { return date.toISOString().slice(0, 10); }

describe("MaintenanceTaskList", () => {
  beforeEach(() => {
    useDobyStore.getState().resetStore();
  });

  it("renders 'no tasks' state when nothing scheduled", () => {
    render(<MaintenanceTaskList />);
    expect(screen.getByText(/No maintenance tasks/i)).toBeInTheDocument();
  });

  it("aggregates system service, filter changes, projects, and custom tasks", () => {
    const today = new Date();

    useDobyStore.getState().addSystem({
      id: "s1", name: "Furnace", icon: "thermometer", category: "hvac",
      scope: "whole-home", installDate: "2020-01-01",
      lastServiceDate: iso(addDays(today, -10)),
      nextServiceDate: iso(addDays(today, 14)),
      warrantyExpiration: "", estimatedLifeYears: 25,
      estimatedReplaceCost: 0, condition: "good", notes: "",
      filterSize: "16x25x1", filterChangeIntervalMonths: 1,
    });

    useDobyStore.getState().addRoom({
      id: "r1", name: "Basement", icon: "home", color: "#000",
      floor: "Basement", widthFt: 10, widthIn: 0, heightFt: 10, heightIn: 0,
      planX: 0, planY: 0, inventory: [], wishlist: [],
      materials: { ...defaultMaterials }, systemIds: ["s1"],
    });

    useDobyStore.getState().addProject({
      id: "p1", name: "Repaint deck", status: "in-progress",
      budget: 500, actualSpend: 0, startDate: "",
      endDate: iso(addDays(today, 7)), permitNumber: "", notes: "",
    });

    useDobyStore.getState().addCustomTask({
      id: "t1", name: "Clean gutters", location: "Exterior",
      dueDate: iso(addDays(today, 3)), priority: "medium", completed: false,
    });

    render(<MaintenanceTaskList />);

    expect(screen.getByText("Furnace service")).toBeInTheDocument();
    expect(screen.getByText("Replace Furnace filter")).toBeInTheDocument();
    expect(screen.getByText("Repaint deck")).toBeInTheDocument();
    expect(screen.getByText("Clean gutters")).toBeInTheDocument();

    // System filter task should attribute to the room that links the system
    expect(screen.getAllByText("Basement").length).toBeGreaterThan(0);
  });

  it("hides completed custom tasks", () => {
    useDobyStore.getState().addCustomTask({
      id: "t1", name: "Done task", location: "—",
      dueDate: "", priority: "low", completed: true, completedDate: "2026-01-01",
    });
    render(<MaintenanceTaskList />);
    expect(screen.queryByText("Done task")).not.toBeInTheDocument();
  });
});
