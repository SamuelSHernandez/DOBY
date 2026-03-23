"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings2,
  Wallet,
  Wrench,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/home", icon: LayoutDashboard },
  { label: "Systems", href: "/systems", icon: Settings2 },
  { label: "Finances", href: "/finances", icon: Wallet },
  { label: "Upkeep", href: "/upkeep", icon: Wrench },
  { label: "More", href: "/reference", icon: MoreHorizontal },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Top bar */}
      <header className="safe-top fixed left-0 right-0 top-0 z-30 flex h-12 items-center border-b border-border bg-panel px-4 md:hidden">
        <h1 className="text-base font-bold tracking-widest text-text-primary">
          DOBY
        </h1>
      </header>

      {/* Bottom nav — safe-bottom for iPhone home indicator */}
      <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-border bg-panel md:hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
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
