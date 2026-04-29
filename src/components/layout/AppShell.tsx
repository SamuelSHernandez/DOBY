"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { Toaster } from "sonner";
import { useDobyStore } from "@/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { pullOrSeed, subscribePush } from "@/lib/sync";

type SyncStatus = "checking" | "syncing" | "ready" | "anonymous" | "skipped";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useDobyStore((s) => s.theme);
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<SyncStatus>(
    isSupabaseConfigured ? "checking" : "skipped",
  );

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  useEffect(() => {
    if (!supabase) return;

    let unsubPush: (() => void) | null = null;

    async function bootstrap(userId: string | null) {
      if (!userId) {
        setStatus("anonymous");
        return;
      }
      setStatus("syncing");
      await pullOrSeed(userId);
      unsubPush = subscribePush(userId);
      setStatus("ready");
    }

    supabase.auth.getSession().then(({ data }) => {
      void bootstrap(data.session?.user.id ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      // Tear down old push subscription on any auth change.
      if (unsubPush) {
        unsubPush();
        unsubPush = null;
      }
      if (event === "SIGNED_OUT") {
        setStatus("anonymous");
      } else if (session?.user.id) {
        void bootstrap(session.user.id);
      }
    });

    return () => {
      if (unsubPush) unsubPush();
      listener.subscription.unsubscribe();
    };
  }, []);

  // Redirect to /auth when signed out (but never away from /auth itself).
  useEffect(() => {
    if (status === "anonymous" && pathname !== "/auth") {
      router.replace("/auth");
    }
  }, [status, pathname, router]);

  const onAuthRoute = pathname === "/auth";

  // The /auth page renders standalone — no nav, no gate.
  if (onAuthRoute) {
    return (
      <>
        <main className="min-h-screen px-4">{children}</main>
        <Toaster position="top-center" />
      </>
    );
  }

  // Loading while we check session / pull cloud state.
  if (status === "checking" || status === "syncing") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-[11px] uppercase tracking-wider text-text-tertiary">
          {status === "checking" ? "Checking session…" : "Syncing…"}
        </p>
      </main>
    );
  }

  // Anonymous + redirect not yet applied — render nothing this frame.
  if (status === "anonymous") return null;

  return (
    <>
      <Sidebar />
      <MobileNav />
      <main className="min-h-screen pt-14 pb-24 px-4 md:pt-0 md:pb-0 md:pl-[200px] md:px-8">
        <div className="mx-auto max-w-6xl py-4 md:py-8">
          {children}
        </div>
      </main>
      <Toaster
        position="top-center"
        toastOptions={{
          className: "md:!bottom-4 md:!right-4 md:!top-auto md:!left-auto",
          style: {
            background: "var(--d-panel)",
            color: "var(--d-text-primary)",
            border: "1px solid var(--d-border)",
            borderRadius: "0px",
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
          },
        }}
      />
    </>
  );
}
