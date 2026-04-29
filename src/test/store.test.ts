import { describe, it, expect, beforeEach } from "vitest";
import { useDobyStore } from "@/store";
import { defaultMaterials } from "@/store/defaults";

describe("Zustand Store", () => {
  beforeEach(() => {
    useDobyStore.getState().resetStore();
  });

  describe("rooms", () => {
    it("adds a room", () => {
      useDobyStore.getState().addRoom({
        id: "r1", name: "Office", icon: "monitor", color: "#058C42",
        floor: "Main", widthFt: 10, widthIn: 3, heightFt: 10, heightIn: 10,
        planX: 0, planY: 0, inventory: [], wishlist: [],
        materials: { ...defaultMaterials }, systemIds: [],
      });
      expect(useDobyStore.getState().rooms).toHaveLength(1);
      expect(useDobyStore.getState().rooms[0].name).toBe("Office");
    });

    it("deletes a room", () => {
      useDobyStore.getState().addRoom({
        id: "r1", name: "Office", icon: "monitor", color: "#058C42",
        floor: "Main", widthFt: 10, widthIn: 0, heightFt: 10, heightIn: 0,
        planX: 0, planY: 0, inventory: [], wishlist: [],
        materials: { ...defaultMaterials }, systemIds: [],
      });
      useDobyStore.getState().deleteRoom("r1");
      expect(useDobyStore.getState().rooms).toHaveLength(0);
    });
  });

  describe("systems", () => {
    it("adds a system with scope", () => {
      useDobyStore.getState().addSystem({
        id: "s1", name: "HVAC", icon: "thermometer", category: "hvac",
        scope: "whole-home", installDate: "2020-01-01", lastServiceDate: "",
        nextServiceDate: "2026-06-01", warrantyExpiration: "", estimatedLifeYears: 25,
        estimatedReplaceCost: 5000, condition: "good", notes: "",
      });
      const sys = useDobyStore.getState().systems[0];
      expect(sys.scope).toBe("whole-home");
    });

    it("completeSystemService updates dates", () => {
      useDobyStore.getState().addSystem({
        id: "s1", name: "HVAC", icon: "thermometer", category: "hvac",
        scope: "whole-home", installDate: "2020-01-01",
        lastServiceDate: "2025-01-01", nextServiceDate: "2026-01-01",
        warrantyExpiration: "", estimatedLifeYears: 25,
        estimatedReplaceCost: 5000, condition: "good", notes: "",
      });
      useDobyStore.getState().completeSystemService("s1");
      const sys = useDobyStore.getState().systems[0];
      const today = new Date().toISOString().slice(0, 10);
      expect(sys.lastServiceDate).toBe(today);
      expect(sys.nextServiceDate).not.toBe("2026-01-01");
    });

    it("deleting a system removes it from room systemIds", () => {
      useDobyStore.getState().addSystem({
        id: "s1", name: "Washer", icon: "shirt", category: "appliances",
        scope: "room-specific", installDate: "", lastServiceDate: "",
        nextServiceDate: "", warrantyExpiration: "", estimatedLifeYears: 10,
        estimatedReplaceCost: 800, condition: "good", notes: "",
      });
      useDobyStore.getState().addRoom({
        id: "r1", name: "Laundry", icon: "shirt", color: "#EC4899",
        floor: "Main", widthFt: 8, widthIn: 0, heightFt: 6, heightIn: 0,
        planX: 0, planY: 0, inventory: [], wishlist: [],
        materials: { ...defaultMaterials }, systemIds: ["s1"],
      });
      useDobyStore.getState().deleteSystem("s1");
      expect(useDobyStore.getState().rooms[0].systemIds).toEqual([]);
    });
  });

  describe("inventory", () => {
    it("adds inventory item to a room", () => {
      useDobyStore.getState().addRoom({
        id: "r1", name: "Office", icon: "monitor", color: "#058C42",
        floor: "Main", widthFt: 10, widthIn: 0, heightFt: 10, heightIn: 0,
        planX: 0, planY: 0, inventory: [], wishlist: [],
        materials: { ...defaultMaterials }, systemIds: [],
      });
      useDobyStore.getState().addInventoryItem("r1", {
        id: "i1", name: "Desk", cost: 500, purchaseDate: "2024-01-01",
        condition: "excellent", notes: "Standing desk",
      });
      const room = useDobyStore.getState().rooms[0];
      expect(room.inventory).toHaveLength(1);
      expect(room.inventory[0].cost).toBe(500);
    });
  });

  describe("custom tasks", () => {
    it("adds and completes a custom task", () => {
      useDobyStore.getState().addCustomTask({
        id: "t1", name: "Clean gutters", location: "Exterior",
        dueDate: "2026-04-01", priority: "medium", completed: false,
      });
      expect(useDobyStore.getState().customTasks).toHaveLength(1);

      useDobyStore.getState().completeCustomTask("t1");
      const task = useDobyStore.getState().customTasks[0];
      expect(task.completed).toBe(true);
      expect(task.completedDate).toBeDefined();
    });
  });

  describe("expenses (CRUD factory)", () => {
    it("adds an expense", () => {
      useDobyStore.getState().addExpense({ id: "e1", amount: 250, category: "Repair", date: "2026-03-01", description: "Faucet" });
      expect(useDobyStore.getState().expenses).toHaveLength(1);
      expect(useDobyStore.getState().expenses[0].amount).toBe(250);
    });

    it("updates an expense", () => {
      useDobyStore.getState().addExpense({ id: "e1", amount: 250, category: "Repair", date: "2026-03-01", description: "Faucet" });
      useDobyStore.getState().updateExpense("e1", { amount: 300 });
      expect(useDobyStore.getState().expenses[0].amount).toBe(300);
    });

    it("deletes an expense", () => {
      useDobyStore.getState().addExpense({ id: "e1", amount: 250, category: "Repair", date: "2026-03-01", description: "Faucet" });
      useDobyStore.getState().deleteExpense("e1");
      expect(useDobyStore.getState().expenses).toHaveLength(0);
    });
  });

  describe("utilities (CRUD factory)", () => {
    it("adds a utility bill", () => {
      useDobyStore.getState().addUtility({ id: "u1", type: "Electric", amount: 120, date: "2026-03" });
      expect(useDobyStore.getState().utilities).toHaveLength(1);
    });

    it("deletes a utility bill", () => {
      useDobyStore.getState().addUtility({ id: "u1", type: "Electric", amount: 120, date: "2026-03" });
      useDobyStore.getState().deleteUtility("u1");
      expect(useDobyStore.getState().utilities).toHaveLength(0);
    });
  });

  describe("contractors (CRUD factory)", () => {
    it("adds and updates a contractor", () => {
      useDobyStore.getState().addContractor({ id: "c1", name: "Joe", type: "Plumber", phone: "", email: "", rating: 4, lastUsedDate: "", notes: "" });
      useDobyStore.getState().updateContractor("c1", { rating: 5 });
      expect(useDobyStore.getState().contractors[0].rating).toBe(5);
    });

    it("deletes a contractor", () => {
      useDobyStore.getState().addContractor({ id: "c1", name: "Joe", type: "Plumber", phone: "", email: "", rating: 4, lastUsedDate: "", notes: "" });
      useDobyStore.getState().deleteContractor("c1");
      expect(useDobyStore.getState().contractors).toHaveLength(0);
    });
  });

  describe("documents (CRUD factory)", () => {
    it("adds and deletes a document", () => {
      useDobyStore.getState().addDocument({ id: "d1", name: "Deed", category: "Deed", date: "2024-01-01", location: "Safe" });
      expect(useDobyStore.getState().documents).toHaveLength(1);
      useDobyStore.getState().deleteDocument("d1");
      expect(useDobyStore.getState().documents).toHaveLength(0);
    });
  });

  describe("projects (CRUD factory)", () => {
    it("adds and updates a project", () => {
      useDobyStore.getState().addProject({
        id: "p1", name: "Paint bedroom", status: "planned",
        startDate: "", endDate: "", budget: 500, actualSpend: 0,
        contractorId: "", permitNumber: "", notes: "",
      });
      useDobyStore.getState().updateProject("p1", { status: "in-progress" });
      expect(useDobyStore.getState().projects[0].status).toBe("in-progress");
    });
  });

  describe("wishlist", () => {
    it("adds and purchases a wishlist item", () => {
      useDobyStore.getState().addRoom({
        id: "r1", name: "Office", icon: "monitor", color: "#058C42",
        floor: "Main", widthFt: 10, widthIn: 0, heightFt: 10, heightIn: 0,
        planX: 0, planY: 0, inventory: [], wishlist: [],
        materials: { ...defaultMaterials }, systemIds: [],
      });
      useDobyStore.getState().addWishlistItem("r1", {
        id: "w1", name: "Monitor", price: 400, url: "", priority: "high",
        notes: "", imageUrl: "", vendor: "Amazon",
      });
      expect(useDobyStore.getState().rooms[0].wishlist).toHaveLength(1);

      useDobyStore.getState().purchaseWishlistItem("r1", "w1");
      const room = useDobyStore.getState().rooms[0];
      expect(room.wishlist).toHaveLength(0);
      expect(room.inventory).toHaveLength(1);
      expect(room.inventory[0].name).toBe("Monitor");
      expect(room.inventory[0].cost).toBe(400);
    });
  });

  describe("room photos and maintenance", () => {
    it("adds and deletes room photos", () => {
      useDobyStore.getState().addRoom({
        id: "r1", name: "Office", icon: "monitor", color: "#058C42",
        floor: "Main", widthFt: 10, widthIn: 0, heightFt: 10, heightIn: 0,
        planX: 0, planY: 0, inventory: [], wishlist: [],
        materials: { ...defaultMaterials }, systemIds: [],
      });
      useDobyStore.getState().addRoomPhoto("r1", { id: "ph1", url: "https://example.com/img.jpg", date: "2026-01-01" });
      expect(useDobyStore.getState().rooms[0].photos).toHaveLength(1);
      useDobyStore.getState().deleteRoomPhoto("r1", "ph1");
      expect(useDobyStore.getState().rooms[0].photos).toHaveLength(0);
    });

    it("adds and deletes maintenance entries", () => {
      useDobyStore.getState().addRoom({
        id: "r1", name: "Office", icon: "monitor", color: "#058C42",
        floor: "Main", widthFt: 10, widthIn: 0, heightFt: 10, heightIn: 0,
        planX: 0, planY: 0, inventory: [], wishlist: [],
        materials: { ...defaultMaterials }, systemIds: [],
      });
      useDobyStore.getState().addMaintenanceEntry("r1", { id: "m1", date: "2026-01-01", description: "Patched drywall" });
      expect(useDobyStore.getState().rooms[0].maintenanceLog).toHaveLength(1);
      useDobyStore.getState().deleteMaintenanceEntry("r1", "m1");
      expect(useDobyStore.getState().rooms[0].maintenanceLog).toHaveLength(0);
    });
  });

  describe("theme", () => {
    it("defaults to dark", () => {
      expect(useDobyStore.getState().theme).toBe("dark");
    });

    it("sets theme to light", () => {
      useDobyStore.getState().setTheme("light");
      expect(useDobyStore.getState().theme).toBe("light");
    });
  });

  describe("feature flags", () => {
    it("defaults alertBanner to true", () => {
      expect(useDobyStore.getState().featureFlags.alertBanner).toBe(true);
    });

    it("updates feature flags", () => {
      useDobyStore.getState().updateFeatureFlags({ advisories: false });
      expect(useDobyStore.getState().featureFlags.advisories).toBe(false);
    });

    it("partial update preserves other flags", () => {
      useDobyStore.getState().updateFeatureFlags({ advisories: false });
      expect(useDobyStore.getState().featureFlags.alertBanner).toBe(true);
      expect(useDobyStore.getState().featureFlags.expenseTracker).toBe(true);
    });
  });

  describe("property", () => {
    it("updates property with new fields", () => {
      useDobyStore.getState().updateProperty({
        closingCosts: 8000,
        hoaMonthly: 150,
        homeImage: "data:image/png;base64,abc",
      });
      const prop = useDobyStore.getState().property;
      expect(prop.closingCosts).toBe(8000);
      expect(prop.hoaMonthly).toBe(150);
      expect(prop.homeImage).toBe("data:image/png;base64,abc");
    });
  });

  describe("resetStore", () => {
    it("clears all data", () => {
      useDobyStore.getState().addRoom({
        id: "r1", name: "Test", icon: "home", color: "#000",
        floor: "Main", widthFt: 10, widthIn: 0, heightFt: 10, heightIn: 0,
        planX: 0, planY: 0, inventory: [], wishlist: [],
        materials: { ...defaultMaterials }, systemIds: [],
      });
      useDobyStore.getState().resetStore();
      expect(useDobyStore.getState().rooms).toHaveLength(0);
      expect(useDobyStore.getState().property.address).toBe("");
    });
  });
});
