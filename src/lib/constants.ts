export const NAV_ITEMS = [
  { label: "Home", href: "/home", icon: "layout-dashboard" },
  { label: "Systems", href: "/systems", icon: "settings-2" },
  { label: "Finances", href: "/finances", icon: "wallet" },
  { label: "Upkeep", href: "/upkeep", icon: "wrench" },
  { label: "Reference", href: "/reference", icon: "book-open" },
] as const;

export const PIXELS_PER_INCH = 5;

export function generateId(): string {
  return crypto.randomUUID();
}
