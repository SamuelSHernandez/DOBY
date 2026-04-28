"use client";

import { useEffect } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { Toaster } from "sonner";
import { useDobyStore } from "@/store";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useDobyStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

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
