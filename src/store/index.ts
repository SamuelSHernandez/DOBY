import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  DobyState,
  Property,
  Mortgage,
  Appreciation,
  InsurancePolicy,
  EmergencyInfo,
  Room,
  HomeSystem,
  Expense,
  UtilityBill,
  Project,
  Contractor,
  DocumentRef,
  CustomTask,
  FeatureFlags,
  InventoryItem,
  WishlistItem,
  RoomMaterials,
} from "./types";
import { defaultState } from "./defaults";

interface DobyActions {
  // Property
  updateProperty: (data: Partial<Property>) => void;
  updateMortgage: (data: Partial<Mortgage>) => void;
  updateAppreciation: (data: Partial<Appreciation>) => void;
  updateInsurance: (data: Partial<InsurancePolicy>) => void;

  // Rooms
  addRoom: (room: Room) => void;
  updateRoom: (id: string, data: Partial<Room>) => void;
  deleteRoom: (id: string) => void;

  // Inventory
  addInventoryItem: (roomId: string, item: InventoryItem) => void;
  updateInventoryItem: (roomId: string, itemId: string, data: Partial<InventoryItem>) => void;
  deleteInventoryItem: (roomId: string, itemId: string) => void;

  // Wishlist
  addWishlistItem: (roomId: string, item: WishlistItem) => void;
  updateWishlistItem: (roomId: string, itemId: string, data: Partial<WishlistItem>) => void;
  deleteWishlistItem: (roomId: string, itemId: string) => void;

  // Room materials
  updateRoomMaterials: (roomId: string, materials: Partial<RoomMaterials>) => void;

  // Room systems
  linkSystem: (roomId: string, systemId: string) => void;
  unlinkSystem: (roomId: string, systemId: string) => void;

  // Systems
  addSystem: (system: HomeSystem) => void;
  updateSystem: (id: string, data: Partial<HomeSystem>) => void;
  deleteSystem: (id: string) => void;

  // Expenses
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Utilities
  addUtility: (bill: UtilityBill) => void;
  updateUtility: (id: string, data: Partial<UtilityBill>) => void;
  deleteUtility: (id: string) => void;

  // Projects
  addProject: (project: Project) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Seasonal tasks
  toggleSeasonalTask: (key: string) => void;

  // Contractors
  addContractor: (contractor: Contractor) => void;
  updateContractor: (id: string, data: Partial<Contractor>) => void;
  deleteContractor: (id: string) => void;

  // Documents
  addDocument: (doc: DocumentRef) => void;
  updateDocument: (id: string, data: Partial<DocumentRef>) => void;
  deleteDocument: (id: string) => void;

  // Emergency
  updateEmergencyInfo: (data: Partial<EmergencyInfo>) => void;

  // Custom tasks
  addCustomTask: (task: CustomTask) => void;
  updateCustomTask: (id: string, data: Partial<CustomTask>) => void;
  deleteCustomTask: (id: string) => void;
  completeCustomTask: (id: string) => void;

  // System service completion
  completeSystemService: (systemId: string) => void;

  // Feature flags
  updateFeatureFlags: (flags: Partial<FeatureFlags>) => void;

  // Meta
  isInitialized: () => boolean;
  resetStore: () => void;
}

export type DobyStore = DobyState & DobyActions;

function updateItemInArray<T extends { id: string }>(
  arr: T[],
  id: string,
  data: Partial<T>
): T[] {
  return arr.map((item) => (item.id === id ? { ...item, ...data } : item));
}

export const useDobyStore = create<DobyStore>()(
  persist(
    (set, get) => ({
      ...defaultState,

      // Property
      updateProperty: (data) =>
        set((s) => ({ property: { ...s.property, ...data } })),
      updateMortgage: (data) =>
        set((s) => ({ mortgage: { ...s.mortgage, ...data } })),
      updateAppreciation: (data) =>
        set((s) => ({ appreciation: { ...s.appreciation, ...data } })),
      updateInsurance: (data) =>
        set((s) => ({ insurance: { ...s.insurance, ...data } })),

      // Rooms
      addRoom: (room) => set((s) => ({ rooms: [...s.rooms, room] })),
      updateRoom: (id, data) =>
        set((s) => ({ rooms: updateItemInArray(s.rooms, id, data) })),
      deleteRoom: (id) =>
        set((s) => ({ rooms: s.rooms.filter((r) => r.id !== id) })),

      // Inventory
      addInventoryItem: (roomId, item) =>
        set((s) => ({
          rooms: s.rooms.map((r) =>
            r.id === roomId
              ? { ...r, inventory: [...r.inventory, item] }
              : r
          ),
        })),
      updateInventoryItem: (roomId, itemId, data) =>
        set((s) => ({
          rooms: s.rooms.map((r) =>
            r.id === roomId
              ? { ...r, inventory: updateItemInArray(r.inventory, itemId, data) }
              : r
          ),
        })),
      deleteInventoryItem: (roomId, itemId) =>
        set((s) => ({
          rooms: s.rooms.map((r) =>
            r.id === roomId
              ? { ...r, inventory: r.inventory.filter((i) => i.id !== itemId) }
              : r
          ),
        })),

      // Wishlist
      addWishlistItem: (roomId, item) =>
        set((s) => ({
          rooms: s.rooms.map((r) =>
            r.id === roomId
              ? { ...r, wishlist: [...r.wishlist, item] }
              : r
          ),
        })),
      updateWishlistItem: (roomId, itemId, data) =>
        set((s) => ({
          rooms: s.rooms.map((r) =>
            r.id === roomId
              ? { ...r, wishlist: updateItemInArray(r.wishlist, itemId, data) }
              : r
          ),
        })),
      deleteWishlistItem: (roomId, itemId) =>
        set((s) => ({
          rooms: s.rooms.map((r) =>
            r.id === roomId
              ? { ...r, wishlist: r.wishlist.filter((i) => i.id !== itemId) }
              : r
          ),
        })),

      // Room materials
      updateRoomMaterials: (roomId, materials) =>
        set((s) => ({
          rooms: s.rooms.map((r) =>
            r.id === roomId
              ? { ...r, materials: { ...r.materials, ...materials } }
              : r
          ),
        })),

      // Room systems
      linkSystem: (roomId, systemId) =>
        set((s) => ({
          rooms: s.rooms.map((r) =>
            r.id === roomId && !r.systemIds.includes(systemId)
              ? { ...r, systemIds: [...r.systemIds, systemId] }
              : r
          ),
        })),
      unlinkSystem: (roomId, systemId) =>
        set((s) => ({
          rooms: s.rooms.map((r) =>
            r.id === roomId
              ? { ...r, systemIds: r.systemIds.filter((id) => id !== systemId) }
              : r
          ),
        })),

      // Systems
      addSystem: (system) =>
        set((s) => ({ systems: [...s.systems, system] })),
      updateSystem: (id, data) =>
        set((s) => ({ systems: updateItemInArray(s.systems, id, data) })),
      deleteSystem: (id) =>
        set((s) => ({
          systems: s.systems.filter((sys) => sys.id !== id),
          rooms: s.rooms.map((r) => ({
            ...r,
            systemIds: r.systemIds.filter((sid) => sid !== id),
          })),
        })),

      // Expenses
      addExpense: (expense) =>
        set((s) => ({ expenses: [...s.expenses, expense] })),
      updateExpense: (id, data) =>
        set((s) => ({ expenses: updateItemInArray(s.expenses, id, data) })),
      deleteExpense: (id) =>
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),

      // Utilities
      addUtility: (bill) =>
        set((s) => ({ utilities: [...s.utilities, bill] })),
      updateUtility: (id, data) =>
        set((s) => ({ utilities: updateItemInArray(s.utilities, id, data) })),
      deleteUtility: (id) =>
        set((s) => ({ utilities: s.utilities.filter((u) => u.id !== id) })),

      // Projects
      addProject: (project) =>
        set((s) => ({ projects: [...s.projects, project] })),
      updateProject: (id, data) =>
        set((s) => ({ projects: updateItemInArray(s.projects, id, data) })),
      deleteProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      // Seasonal tasks
      toggleSeasonalTask: (key) =>
        set((s) => ({
          seasonalTasks: {
            ...s.seasonalTasks,
            [key]: !s.seasonalTasks[key],
          },
        })),

      // Contractors
      addContractor: (contractor) =>
        set((s) => ({ contractors: [...s.contractors, contractor] })),
      updateContractor: (id, data) =>
        set((s) => ({
          contractors: updateItemInArray(s.contractors, id, data),
        })),
      deleteContractor: (id) =>
        set((s) => ({
          contractors: s.contractors.filter((c) => c.id !== id),
        })),

      // Documents
      addDocument: (doc) =>
        set((s) => ({ documents: [...s.documents, doc] })),
      updateDocument: (id, data) =>
        set((s) => ({ documents: updateItemInArray(s.documents, id, data) })),
      deleteDocument: (id) =>
        set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),

      // Emergency
      updateEmergencyInfo: (data) =>
        set((s) => ({ emergencyInfo: { ...s.emergencyInfo, ...data } })),

      // Custom tasks
      addCustomTask: (task) =>
        set((s) => ({ customTasks: [...s.customTasks, task] })),
      updateCustomTask: (id, data) =>
        set((s) => ({ customTasks: updateItemInArray(s.customTasks, id, data) })),
      deleteCustomTask: (id) =>
        set((s) => ({ customTasks: s.customTasks.filter((t) => t.id !== id) })),
      completeCustomTask: (id) =>
        set((s) => ({
          customTasks: s.customTasks.map((t) =>
            t.id === id ? { ...t, completed: true, completedDate: new Date().toISOString().slice(0, 10) } : t
          ),
        })),

      // System service completion — update lastServiceDate to today, push nextServiceDate forward
      completeSystemService: (systemId) =>
        set((s) => ({
          systems: s.systems.map((sys) => {
            if (sys.id !== systemId) return sys;
            const today = new Date().toISOString().slice(0, 10);
            // Estimate next service: if we know the interval from last dates, use that; otherwise 6 months
            let nextDate = "";
            if (sys.nextServiceDate && sys.lastServiceDate) {
              const lastMs = new Date(sys.lastServiceDate).getTime();
              const nextMs = new Date(sys.nextServiceDate).getTime();
              const intervalMs = nextMs - lastMs;
              if (intervalMs > 0) {
                nextDate = new Date(Date.now() + intervalMs).toISOString().slice(0, 10);
              }
            }
            if (!nextDate) {
              nextDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
            }
            return { ...sys, lastServiceDate: today, nextServiceDate: nextDate };
          }),
        })),

      // Feature flags
      updateFeatureFlags: (flags) =>
        set((s) => ({ featureFlags: { ...s.featureFlags, ...flags } })),

      // Meta
      isInitialized: () => get().property.address !== "",
      resetStore: () => set(defaultState),
    }),
    {
      name: "doby-store",
    }
  )
);
