"use client";

import { useDobyStore } from "@/store";
import { defaultFeatureFlags } from "@/store/defaults";
import type { FeatureFlags } from "@/store/types";

export function useFeature(key: keyof FeatureFlags): boolean {
  return useDobyStore((s) => s.featureFlags?.[key] ?? defaultFeatureFlags[key]);
}
