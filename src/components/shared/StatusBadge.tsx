import { cn } from "@/lib/utils";

type BadgeVariant = "nominal" | "caution" | "critical" | "neutral";

interface StatusBadgeProps {
  label: string;
  variant: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  nominal: "border-sea-green text-sea-green",
  caution: "border-saffron text-saffron",
  critical: "border-oxblood text-oxblood",
  neutral: "border-border text-text-tertiary",
};

export default function StatusBadge({ label, variant }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        variantStyles[variant]
      )}
    >
      {label}
    </span>
  );
}
