import { useDobyStore } from "@/store";
import { defaultState } from "@/store/defaults";
import type { DobyState } from "@/store/types";
import { supabase } from "./supabase";

const TABLE = "app_state";
const DEBOUNCE_MS = 1000;

/**
 * Strip the action methods off the store so we only persist data.
 */
function pickState(): DobyState {
  const s = useDobyStore.getState();
  const out: DobyState = { ...defaultState };
  for (const key of Object.keys(defaultState) as (keyof DobyState)[]) {
    const setSlice = <K extends keyof DobyState>(k: K, v: DobyState[K]) => {
      out[k] = v;
    };
    setSlice(key, s[key] as DobyState[typeof key]);
  }
  return out;
}

function setState(data: DobyState) {
  useDobyStore.setState(data, false);
}

/**
 * Pull the user's row. If none, seed Supabase with whatever is in
 * the local store (handles the first-sign-in migration from
 * localStorage-only). On subsequent loads cloud overwrites local —
 * for a single user across <=2 devices that's a fine LWW model.
 */
export async function pullOrSeed(userId: string): Promise<void> {
  if (!supabase) return;

  const { data, error } = await supabase
    .from(TABLE)
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[sync] pull failed:", error.message);
    return;
  }

  if (data?.data) {
    setState(data.data as DobyState);
  } else {
    // First time signing in on this account — push current local state.
    await pushNow(userId);
  }
}

let timer: ReturnType<typeof setTimeout> | null = null;
let pendingUserId: string | null = null;

async function pushNow(userId: string): Promise<void> {
  if (!supabase) return;
  const data = pickState();
  const { error } = await supabase
    .from(TABLE)
    .upsert({ user_id: userId, data }, { onConflict: "user_id" });
  if (error) console.error("[sync] push failed:", error.message);
}

/** Subscribe the store to debounced cloud pushes. Returns an unsubscribe. */
export function subscribePush(userId: string): () => void {
  if (!supabase) return () => {};
  pendingUserId = userId;
  const unsub = useDobyStore.subscribe(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      if (pendingUserId) void pushNow(pendingUserId);
    }, DEBOUNCE_MS);
  });
  return () => {
    if (timer) clearTimeout(timer);
    timer = null;
    pendingUserId = null;
    unsub();
  };
}
