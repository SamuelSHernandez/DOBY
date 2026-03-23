"use client";

import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { Toaster } from "sonner";

export default function AppShell({ children }: { children: React.ReactNode }) {
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
            background: "#222327",
            color: "#f0f0f2",
            border: "1px solid #3a3b40",
            borderRadius: "0",
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
          },
        }}
      />
    </>
  );
}
