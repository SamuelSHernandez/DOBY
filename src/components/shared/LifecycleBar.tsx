import { cn } from "@/lib/utils";

interface LifecycleBarProps {
  percent: number;
  variant?: "stepped" | "gradient";
}

export default function LifecycleBar({ percent, variant = "stepped" }: LifecycleBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const remaining = 100 - clamped;

  if (variant === "gradient") {
    const hue = 90 + remaining * 0.5;
    const sat = 20 + remaining * 0.3;
    const color = `hsl(${Math.min(hue, 140)}, ${sat}%, 40%)`;
    return (
      <div className="h-[3px] w-full overflow-hidden rounded-sm bg-surface-dim">
        <div
          className="h-full rounded-sm transition-all duration-500"
          style={{ width: `${remaining}%`, background: color }}
        />
      </div>
    );
  }

  const color =
    clamped > 80 ? "bg-oxblood" : clamped > 50 ? "bg-saffron" : "bg-sea-green";

  return (
    <div className="h-1.5 w-full bg-surface">
      <div
        className={cn("h-full transition-all", color)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
