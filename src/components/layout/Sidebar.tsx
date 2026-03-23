"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings2,
  Wallet,
  Wrench,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  "layout-dashboard": LayoutDashboard,
  "settings-2": Settings2,
  wallet: Wallet,
  wrench: Wrench,
  "book-open": BookOpen,
};

const NAV_ITEMS = [
  { label: "Home", href: "/home", icon: "layout-dashboard" },
  { label: "Systems", href: "/systems", icon: "settings-2" },
  { label: "Finances", href: "/finances", icon: "wallet" },
  { label: "Upkeep", href: "/upkeep", icon: "wrench" },
  { label: "Reference", href: "/reference", icon: "book-open" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[200px] border-r border-border bg-panel md:flex md:flex-col">
      <div className="px-5 py-6">
        <h1 className="text-xl font-bold tracking-widest text-text-primary">
          DOBY
        </h1>
        <p className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
          Home Management
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-l-2 border-azure bg-azure-dim text-text-primary"
                  : "border-l-2 border-transparent text-text-secondary hover:bg-surface hover:text-text-primary"
              )}
            >
              {Icon && <Icon size={16} strokeWidth={2} />}
              <span className="uppercase tracking-wider text-xs">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
