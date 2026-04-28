import { yearsFractional } from "./dates";

export function getSystemLifecyclePct(installDate: string, estimatedLifeYears: number): number {
  if (!installDate || estimatedLifeYears <= 0) return 0;
  const age = yearsFractional(installDate);
  return Math.min(100, (age / estimatedLifeYears) * 100);
}

export function getHealthVariant(pct: number): "critical" | "caution" | "nominal" {
  if (pct > 80) return "critical";
  if (pct > 50) return "caution";
  return "nominal";
}
