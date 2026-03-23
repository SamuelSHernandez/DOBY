import { cn } from "@/lib/utils";

interface StatBoxProps {
  label: string;
  value: string;
  variant?: "default" | "nominal" | "caution" | "critical";
}

const variantStyles = {
  default: "border-border text-text-primary",
  nominal: "border-sea-green text-sea-green",
  caution: "border-saffron text-saffron",
  critical: "border-oxblood text-oxblood",
};

export default function StatBox({ label, value, variant = "default" }: StatBoxProps) {
  return (
    <div className={cn("border bg-surface p-4", variantStyles[variant])}>
      <p className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
        {label}
      </p>
      <p className={cn("mt-1 text-lg font-semibold", variantStyles[variant])}>
        {value}
      </p>
    </div>
  );
}
