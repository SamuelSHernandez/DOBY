"use client";

import { createClient } from "./client";
import type {
  DobyState,
  Property,
  Mortgage,
  Appreciation,
  InsurancePolicy,
  Room,
  InventoryItem,
  WishlistItem,
  HomeSystem,
  Expense,
  UtilityBill,
  Project,
  Contractor,
  DocumentRef,
  CustomTask,
  EmergencyInfo,
} from "@/store/types";

const supabase = createClient();

// ─── Helpers ───

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toSnake(obj: any): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase());
    result[snakeKey] = value;
  }
  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toCamel(obj: any): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = value;
  }
  return result;
}

// ─── Load all data from Supabase ───

export async function loadFromSupabase(userId: string): Promise<Partial<DobyState> | null> {
  try {
    const [
      { data: propRows },
      { data: mortRows },
      { data: appRows },
      { data: insRows },
      { data: roomRows },
      { data: sysRows },
      { data: expRows },
      { data: utilRows },
      { data: projRows },
      { data: seasonRows },
      { data: taskRows },
      { data: emergRows },
      { data: contRows },
      { data: docRows },
    ] = await Promise.all([
      supabase.from("property").select("*").eq("user_id", userId).limit(1),
      supabase.from("mortgage").select("*").eq("user_id", userId).limit(1),
      supabase.from("appreciation").select("*").eq("user_id", userId).limit(1),
      supabase.from("insurance").select("*").eq("user_id", userId).limit(1),
      supabase.from("rooms").select("*").eq("user_id", userId),
      supabase.from("systems").select("*").eq("user_id", userId),
      supabase.from("expenses").select("*").eq("user_id", userId),
      supabase.from("utilities").select("*").eq("user_id", userId),
      supabase.from("projects").select("*").eq("user_id", userId),
      supabase.from("seasonal_tasks").select("*").eq("user_id", userId),
      supabase.from("custom_tasks").select("*").eq("user_id", userId),
      supabase.from("emergency_info").select("*").eq("user_id", userId).limit(1),
      supabase.from("contractors").select("*").eq("user_id", userId),
      supabase.from("documents").select("*").eq("user_id", userId),
    ]);

    // If no property row exists, DB is empty — return null to keep localStorage data
    if (!propRows || propRows.length === 0) return null;

    // Load inventory and wishlist for each room
    const rooms: Room[] = [];
    for (const row of roomRows || []) {
      const { data: invRows } = await supabase
        .from("inventory_items")
        .select("*")
        .eq("room_id", row.id);
      const { data: wishRows } = await supabase
        .from("wishlist_items")
        .select("*")
        .eq("room_id", row.id);

      rooms.push({
        id: row.id,
        name: row.name,
        icon: row.icon,
        color: row.color,
        floor: row.floor,
        widthFt: row.width_ft,
        widthIn: row.width_in,
        heightFt: row.height_ft,
        heightIn: row.height_in,
        planX: row.plan_x,
        planY: row.plan_y,
        materials: row.materials || {},
        systemIds: row.system_ids || [],
        inventory: (invRows || []).map((i) => toCamel(i) as unknown as InventoryItem),
        wishlist: (wishRows || []).map((w) => toCamel(w) as unknown as WishlistItem),
      });
    }

    const prop = propRows[0];
    const mort = mortRows?.[0];
    const app = appRows?.[0];
    const ins = insRows?.[0];
    const emerg = emergRows?.[0];

    const seasonalTasks: Record<string, boolean> = {};
    for (const row of seasonRows || []) {
      seasonalTasks[row.key] = row.completed;
    }

    return {
      property: prop ? toCamel(prop) as unknown as Property : undefined,
      mortgage: mort ? toCamel(mort) as unknown as Mortgage : undefined,
      appreciation: app ? toCamel(app) as unknown as Appreciation : undefined,
      insurance: ins ? toCamel(ins) as unknown as InsurancePolicy : undefined,
      rooms,
      systems: (sysRows || []).map((s) => toCamel(s) as unknown as HomeSystem),
      expenses: (expRows || []).map((e) => toCamel(e) as unknown as Expense),
      utilities: (utilRows || []).map((u) => toCamel(u) as unknown as UtilityBill),
      projects: (projRows || []).map((p) => toCamel(p) as unknown as Project),
      seasonalTasks,
      customTasks: (taskRows || []).map((t) => toCamel(t) as unknown as CustomTask),
      emergencyInfo: emerg ? toCamel(emerg) as unknown as EmergencyInfo : undefined,
      contractors: (contRows || []).map((c) => toCamel(c) as unknown as Contractor),
      documents: (docRows || []).map((d) => toCamel(d) as unknown as DocumentRef),
    };
  } catch (err) {
    console.error("Failed to load from Supabase:", err);
    return null;
  }
}

// ─── Save full state to Supabase ───

export async function saveToSupabase(state: DobyState, userId: string): Promise<void> {
  try {
    // Upsert singleton rows (property, mortgage, appreciation, insurance, emergency)
    await Promise.all([
      upsertSingleton("property", state.property, userId),
      upsertSingleton("mortgage", state.mortgage, userId),
      upsertSingleton("appreciation", state.appreciation, userId),
      upsertSingleton("insurance", state.insurance, userId),
      upsertSingleton("emergency_info", state.emergencyInfo, userId),
    ]);

    // Sync arrays — delete removed, upsert existing
    await syncArray("rooms", state.rooms, (room) => {
      const { inventory, wishlist, materials, systemIds, ...rest } = room;
      return {
        ...toSnake(rest),
        materials,
        system_ids: systemIds,
        user_id: userId,
      };
    }, userId);

    // Sync inventory and wishlist per room
    for (const room of state.rooms) {
      await syncArray("inventory_items", room.inventory, (item) => ({
        ...toSnake(item),
        room_id: room.id,
        user_id: userId,
      }), userId, "room_id", room.id);

      await syncArray("wishlist_items", room.wishlist, (item) => ({
        ...toSnake(item),
        room_id: room.id,
        user_id: userId,
      }), userId, "room_id", room.id);
    }

    await syncArray("systems", state.systems, (s) => ({ ...toSnake(s), user_id: userId }), userId);
    await syncArray("expenses", state.expenses, (e) => ({ ...toSnake(e), user_id: userId }), userId);
    await syncArray("utilities", state.utilities, (u) => ({ ...toSnake(u), user_id: userId }), userId);
    await syncArray("projects", state.projects, (p) => ({ ...toSnake(p), user_id: userId }), userId);
    await syncArray("contractors", state.contractors, (c) => ({ ...toSnake(c), user_id: userId }), userId);
    await syncArray("documents", state.documents, (d) => ({ ...toSnake(d), user_id: userId }), userId);
    await syncArray("custom_tasks", state.customTasks, (t) => ({ ...toSnake(t), user_id: userId }), userId);

    // Seasonal tasks — upsert each key
    const seasonalRows = Object.entries(state.seasonalTasks).map(([key, completed]) => ({
      key,
      completed,
      user_id: userId,
    }));
    if (seasonalRows.length > 0) {
      await supabase.from("seasonal_tasks").upsert(seasonalRows, { onConflict: "key" });
    }
  } catch (err) {
    console.error("Failed to save to Supabase:", err);
  }
}

// ─── Helpers ───

async function upsertSingleton(table: string, data: object, userId: string) {
  const snaked = toSnake(data as Record<string, unknown>);
  snaked.user_id = userId;
  // Check if row exists for this user
  const { data: existing } = await supabase.from(table).select("id").eq("user_id", userId).limit(1);
  if (existing && existing.length > 0) {
    const { id: _existingId, ...updateData } = snaked;
    await supabase.from(table).update({ ...updateData, updated_at: new Date().toISOString() }).eq("id", existing[0].id);
  } else {
    await supabase.from(table).insert(snaked);
  }
}

async function syncArray<T extends { id: string }>(
  table: string,
  items: T[],
  transform: (item: T) => Record<string, unknown>,
  userId: string,
  filterCol?: string,
  filterVal?: string,
) {
  // Get existing IDs for this user
  let query = supabase.from(table).select("id").eq("user_id", userId);
  if (filterCol && filterVal) {
    query = query.eq(filterCol, filterVal);
  }
  const { data: existing } = await query;
  const existingIds = new Set((existing || []).map((r) => r.id));
  const currentIds = new Set(items.map((i) => i.id));

  // Delete removed items
  const toDelete = [...existingIds].filter((id) => !currentIds.has(id));
  if (toDelete.length > 0) {
    await supabase.from(table).delete().in("id", toDelete);
  }

  // Upsert current items
  if (items.length > 0) {
    const rows = items.map(transform);
    await supabase.from(table).upsert(rows, { onConflict: "id" });
  }
}
