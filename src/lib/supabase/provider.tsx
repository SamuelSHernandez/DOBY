"use client";

import { useEffect, useRef } from "react";
import { useDobyStore } from "@/store";
import { createClient } from "./client";
import { loadFromSupabase, saveToSupabase } from "./sync";

export default function SupabaseSync() {
  const store = useDobyStore();
  const initialized = useRef(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(null);
  const userIdRef = useRef<string | null>(null);

  // Load from Supabase on mount (after getting user session)
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return; // Not logged in — middleware will redirect
      userIdRef.current = user.id;

      loadFromSupabase(user.id).then((data) => {
        if (data && data.property && data.property.address) {
          const currentState = useDobyStore.getState();
          if (!currentState.property.address && data.property.address) {
            useDobyStore.setState(data);
            console.log("[Doby] Loaded state from Supabase");
          }
        }
      });
    });
  }, []);

  // Auto-save to Supabase on state changes (debounced 2s)
  useEffect(() => {
    const unsub = useDobyStore.subscribe((state) => {
      if (!userIdRef.current) return;
      const userId = userIdRef.current;

      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        saveToSupabase(state, userId).then(() => {
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
