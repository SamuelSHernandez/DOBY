"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings2,
  Zap,
  Wallet,
  Wrench,
  BookOpen,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDobyStore } from "@/store";
import { useState } from "react";

const NAV_ITEMS: { label: string; href: string | null; icon: React.ElementType }[] = [
  { label: "Home", href: "/home", icon: LayoutDashboard },
  { label: "Systems", href: "/systems", icon: Settings2 },
  { label: "Utilities", href: "/utilities", icon: Zap },
  { label: "Finances", href: "/finances", icon: Wallet },
  { label: "More", href: null, icon: MoreHorizontal },
];

const ALL_MORE_ITEMS: { label: string; href: string; icon: React.ElementType; featureKeys?: string[] }[] = [
{ label: "Upkeep", href: "/upkeep", icon: Wrench },
  { label: "Reference", href: "/reference", icon: BookOpen },
  { label: "Admin", href: "/admin", icon: Settings2 },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const featureFlags = useDobyStore((s) => s.featureFlags);

  const MORE_ITEMS = ALL_MORE_ITEMS.filter((item) => {
    if (!item.featureKeys) return true;
    return item.featureKeys.some((k) => featureFlags[k as keyof typeof featureFlags]);
  });

  const isMoreActive = MORE_ITEMS.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <>
      {/* Top bar */}
      <header className="safe-top fixed left-0 right-0 top-0 z-30 flex h-12 items-center border-b border-border bg-panel px-4 md:hidden">
        <h1 className="text-base font-bold tracking-widest text-text-primary">
          DOBY
        </h1>
      </header>

      {/* More menu overlay */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-carbon/60 md:hidden"
          onClick={() => setMoreOpen(false)}
        >
          <div className="absolute bottom-16 right-2 border border-border bg-panel py-1" onClick={(e) => e.stopPropagation()}>
            {MORE_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className="flex min-h-[44px] items-center gap-3 px-5 text-sm text-text-secondary hover:bg-surface"
                >
                  <Icon size={16} strokeWidth={2} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-border bg-panel md:hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isMore = item.href === null;
          const isActive = isMore
            ? isMoreActive
            : pathname === item.href || pathname.startsWith(item.href + "/");

          if (isMore) {
            return (
              <button
                key="more"
                onClick={() => setMoreOpen((v) => !v)}
                className={cn(
                  "flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1",
                  isActive || moreOpen ? "text-azure" : "text-text-tertiary"
                )}
              >
                <Icon size={20} strokeWidth={2} />
                <span className="text-[10px] font-medium uppercase tracking-wider">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.href!}
              href={item.href!}
              className={cn(
                "flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1",
                isActive ? "text-azure" : "text-text-tertiary"
              )}
            >
              <Icon size={20} strokeWidth={2} />
              <span className="text-[10px] font-medium uppercase tracking-wider">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
