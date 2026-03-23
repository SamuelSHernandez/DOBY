import { cn } from "@/lib/utils";

interface LifecycleBarProps {
  percent: number;
}

export default function LifecycleBar({ percent }: LifecycleBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
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
