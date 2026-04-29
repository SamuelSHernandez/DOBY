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
  RoomPhoto,
  MaintenanceEntry,
  Theme,
} from "./types";
import { defaultState } from "./defaults";

// ─── Helpers ───

type IdItem = { id: string };
type ArrayKeysWithId<T> = { [K in keyof T]: T[K] extends IdItem[] ? K : never }[keyof T];
type ElementOf<A> = A extends Array<infer U> ? U : never;

type RoomSubArrays = {
  [K in keyof Room as NonNullable<Room[K]> extends IdItem[] ? K : never]-?: NonNullable<Room[K]>;
};

function updateInArray<T extends IdItem>(arr: T[], id: string, data: Partial<T>): T[] {
  return arr.map((item) => (item.id === id ? { ...item, ...data } : item));
}

type SetFn = (fn: (s: DobyState) => Partial<DobyState>) => void;

function crudActions<K extends ArrayKeysWithId<DobyState>>(key: K, set: SetFn) {
  type Item = ElementOf<DobyState[K]>;
  const get = (s: DobyState): Item[] => s[key] as Item[];
  return {
    add: (item: Item) => set((s) => ({ [key]: [...get(s), item] }) as Partial<DobyState>),
    update: (id: string, data: Partial<Item>) =>
      set((s) => ({ [key]: updateInArray(get(s), id, data) }) as Partial<DobyState>),
    delete: (id: string) =>
      set((s) => ({ [key]: get(s).filter((x) => x.id !== id) }) as Partial<DobyState>),
  };
}

function roomSubActions<K extends keyof RoomSubArrays>(field: K, set: SetFn) {
  type Item = ElementOf<RoomSubArrays[K]>;
  const get = (r: Room): Item[] => ((r as Room & Record<K, Item[] | undefined>)[field] ?? []);
  return {
    add: (roomId: string, item: Item) =>
      set((s) => ({
        rooms: s.rooms.map((r) =>
          r.id === roomId ? ({ ...r, [field]: [...get(r), item] } as Room) : r,
        ),
      })),
    delete: (roomId: string, itemId: string) =>
      set((s) => ({
        rooms: s.rooms.map((r) =>
          r.id === roomId
            ? ({ ...r, [field]: get(r).filter((x) => x.id !== itemId) } as Room)
            : r,
        ),
      })),
  };
}

// ─── Action Types ───

interface DobyActions {
  updateProperty: (data: Partial<Property>) => void;
  updateGlobalMaterials: (data: Partial<RoomMaterials>) => void;
  updateMortgage: (data: Partial<Mortgage>) => void;
  updateAppreciation: (data: Partial<Appreciation>) => void;
  updateInsurance: (data: Partial<InsurancePolicy>) => void;
  addRoom: (room: Room) => void;
  updateRoom: (id: string, data: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  addInventoryItem: (roomId: string, item: InventoryItem) => void;
  updateInventoryItem: (roomId: string, itemId: string, data: Partial<InventoryItem>) => void;
  deleteInventoryItem: (roomId: string, itemId: string) => void;
  addWishlistItem: (roomId: string, item: WishlistItem) => void;
  updateWishlistItem: (roomId: string, itemId: string, data: Partial<WishlistItem>) => void;
  deleteWishlistItem: (roomId: string, itemId: string) => void;
  purchaseWishlistItem: (roomId: string, itemId: string) => void;
  updateRoomNotes: (roomId: string, notes: string) => void;
  addRoomPhoto: (roomId: string, photo: RoomPhoto) => void;
  deleteRoomPhoto: (roomId: string, photoId: string) => void;
  addMaintenanceEntry: (roomId: string, entry: MaintenanceEntry) => void;
  deleteMaintenanceEntry: (roomId: string, entryId: string) => void;
  updateRoomMaterials: (roomId: string, materials: Partial<RoomMaterials>) => void;
  linkSystem: (roomId: string, systemId: string) => void;
  unlinkSystem: (roomId: string, systemId: string) => void;
  addSystem: (system: HomeSystem) => void;
  updateSystem: (id: string, data: Partial<HomeSystem>) => void;
  deleteSystem: (id: string) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addUtility: (bill: UtilityBill) => void;
  updateUtility: (id: string, data: Partial<UtilityBill>) => void;
  deleteUtility: (id: string) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  toggleSeasonalTask: (key: string) => void;
  addContractor: (contractor: Contractor) => void;
  updateContractor: (id: string, data: Partial<Contractor>) => void;
  deleteContractor: (id: string) => void;
  addDocument: (doc: DocumentRef) => void;
  updateDocument: (id: string, data: Partial<DocumentRef>) => void;
  deleteDocument: (id: string) => void;
  updateEmergencyInfo: (data: Partial<EmergencyInfo>) => void;
  addCustomTask: (task: CustomTask) => void;
  updateCustomTask: (id: string, data: Partial<CustomTask>) => void;
  deleteCustomTask: (id: string) => void;
  completeCustomTask: (id: string) => void;
  completeSystemService: (systemId: string) => void;
  updateFeatureFlags: (flags: Partial<FeatureFlags>) => void;
  setTheme: (theme: Theme) => void;
  isInitialized: () => boolean;
  resetStore: () => void;
}

export type DobyStore = DobyState & DobyActions;

export const useDobyStore = create<DobyStore>()(
  persist(
    (set, get) => {
      const expenses = crudActions("expenses", set);
      const utilities = crudActions("utilities", set);
      const projects = crudActions("projects", set);
      const contractors = crudActions("contractors", set);
      const documents = crudActions("documents", set);
      const customTasks = crudActions("customTasks", set);
      const inventory = roomSubActions("inventory", set);
      const wishlist = roomSubActions("wishlist", set);
      const photos = roomSubActions("photos", set);
      const maintenance = roomSubActions("maintenanceLog", set);

      return {
        ...defaultState,

        // Property (single-object updates)
        updateProperty: (data) => set((s) => ({ property: { ...s.property, ...data } })),
        updateGlobalMaterials: (data) => set((s) => ({ globalMaterials: { ...s.globalMaterials, ...data } })),
        updateMortgage: (data) => set((s) => ({ mortgage: { ...s.mortgage, ...data } })),
        updateAppreciation: (data) => set((s) => ({ appreciation: { ...s.appreciation, ...data } })),
        updateInsurance: (data) => set((s) => ({ insurance: { ...s.insurance, ...data } })),
        updateEmergencyInfo: (data) => set((s) => ({ emergencyInfo: { ...s.emergencyInfo, ...data } })),

        // Rooms (custom delete cleans up system links)
        addRoom: (room) => set((s) => ({ rooms: [...s.rooms, room] })),
        updateRoom: (id, data) => set((s) => ({ rooms: updateInArray(s.rooms, id, data) })),
        deleteRoom: (id) => set((s) => ({ rooms: s.rooms.filter((r) => r.id !== id) })),

        // Room sub-collections
        addInventoryItem: inventory.add,
        deleteInventoryItem: inventory.delete,
        updateInventoryItem: (roomId, itemId, data) =>
          set((s) => ({ rooms: s.rooms.map((r) => r.id === roomId ? { ...r, inventory: updateInArray(r.inventory, itemId, data) } : r) })),
        addWishlistItem: wishlist.add,
        deleteWishlistItem: wishlist.delete,
        updateWishlistItem: (roomId, itemId, data) =>
          set((s) => ({ rooms: s.rooms.map((r) => r.id === roomId ? { ...r, wishlist: updateInArray(r.wishlist, itemId, data) } : r) })),
        purchaseWishlistItem: (roomId, itemId) =>
          set((s) => ({
            rooms: s.rooms.map((r) => {
              if (r.id !== roomId) return r;
              const item = r.wishlist.find((i) => i.id === itemId);
              if (!item) return r;
              const inv: InventoryItem = {
                id: item.id, name: item.name, cost: item.price,
                purchaseDate: new Date().toISOString().slice(0, 10),
                condition: "excellent", notes: item.notes, imageUrl: item.imageUrl,
                vendor: item.vendor, receiptUrl: item.url || undefined,
                purchaseSource: item.vendor || undefined,
              };
              return { ...r, wishlist: r.wishlist.filter((i) => i.id !== itemId), inventory: [...r.inventory, inv] };
            }),
          })),
        addRoomPhoto: photos.add,
        deleteRoomPhoto: photos.delete,
        addMaintenanceEntry: maintenance.add,
        deleteMaintenanceEntry: maintenance.delete,
        updateRoomNotes: (roomId, notes) =>
          set((s) => ({ rooms: s.rooms.map((r) => r.id === roomId ? { ...r, notes } : r) })),
        updateRoomMaterials: (roomId, materials) =>
          set((s) => ({ rooms: s.rooms.map((r) => r.id === roomId ? { ...r, materials: { ...r.materials, ...materials } } : r) })),
        linkSystem: (roomId, systemId) =>
          set((s) => ({ rooms: s.rooms.map((r) => r.id === roomId && !r.systemIds.includes(systemId) ? { ...r, systemIds: [...r.systemIds, systemId] } : r) })),
        unlinkSystem: (roomId, systemId) =>
          set((s) => ({ rooms: s.rooms.map((r) => r.id === roomId ? { ...r, systemIds: r.systemIds.filter((id) => id !== systemId) } : r) })),

        // Systems (custom delete cleans up room links)
        addSystem: (system) => set((s) => ({ systems: [...s.systems, system] })),
        updateSystem: (id, data) => set((s) => ({ systems: updateInArray(s.systems, id, data) })),
        deleteSystem: (id) => set((s) => ({
          systems: s.systems.filter((sys) => sys.id !== id),
          rooms: s.rooms.map((r) => ({ ...r, systemIds: r.systemIds.filter((sid) => sid !== id) })),
        })),

        // Standard CRUD collections
        addExpense: expenses.add, updateExpense: expenses.update, deleteExpense: expenses.delete,
        addUtility: utilities.add, updateUtility: utilities.update, deleteUtility: utilities.delete,
        addProject: projects.add, updateProject: projects.update, deleteProject: projects.delete,
        addContractor: contractors.add, updateContractor: contractors.update, deleteContractor: contractors.delete,
        addDocument: documents.add, updateDocument: documents.update, deleteDocument: documents.delete,
        addCustomTask: customTasks.add, updateCustomTask: customTasks.update, deleteCustomTask: customTasks.delete,

        // Seasonal tasks
        toggleSeasonalTask: (key) => set((s) => ({ seasonalTasks: { ...s.seasonalTasks, [key]: !s.seasonalTasks[key] } })),

        // Custom task completion
        completeCustomTask: (id) =>
          set((s) => ({ customTasks: s.customTasks.map((t) => t.id === id ? { ...t, completed: true, completedDate: new Date().toISOString().slice(0, 10) } : t) })),

        // System service completion
        completeSystemService: (systemId) =>
          set((s) => ({
            systems: s.systems.map((sys) => {
              if (sys.id !== systemId) return sys;
              const today = new Date().toISOString().slice(0, 10);
              let nextDate = "";
              if (sys.nextServiceDate && sys.lastServiceDate) {
                const intervalMs = new Date(sys.nextServiceDate).getTime() - new Date(sys.lastServiceDate).getTime();
                if (intervalMs > 0) nextDate = new Date(Date.now() + intervalMs).toISOString().slice(0, 10);
              }
              if (!nextDate) nextDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
              return { ...sys, lastServiceDate: today, nextServiceDate: nextDate };
            }),
          })),

        // Settings
        updateFeatureFlags: (flags) => set((s) => ({ featureFlags: { ...s.featureFlags, ...flags } })),
        setTheme: (theme) => set({ theme }),
        isInitialized: () => get().property.address !== "",
        resetStore: () => set(defaultState),
      };
    },
    { name: "doby-store" }
  )
);
