"use client";

import { useEffect, useRef } from "react";
import { useDobyStore } from "@/store";
import { loadFromSupabase, saveToSupabase } from "./sync";
import { toast } from "sonner";

export default function SupabaseSync() {
  const store = useDobyStore();
  const initialized = useRef(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  // Load from Supabase on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    loadFromSupabase().then((data) => {
      if (data && data.property && data.property.address) {
        // Supabase has data — merge it into the store
        // Only override if Supabase data looks populated
        const currentState = useDobyStore.getState();
        if (!currentState.property.address && data.property.address) {
          // Local store is empty, Supabase has data — use Supabase
          useDobyStore.setState(data);
          console.log("[Doby] Loaded state from Supabase");
        }
      }
    });
  }, []);

  // Auto-save to Supabase on state changes (debounced 2s)
  useEffect(() => {
    const unsub = useDobyStore.subscribe((state) => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        saveToSupabase(state).then(() => {
          console.log("[Doby] Synced to Supabase");
        });
      }, 2000);
    });

    return () => {
      unsub();
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, []);

  return null;
}
