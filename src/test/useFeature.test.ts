import { describe, it, expect, beforeEach } from "vitest";
import { useDobyStore } from "@/store";
import { defaultFeatureFlags } from "@/store/defaults";

describe("useFeature fallback logic", () => {
  beforeEach(() => {
    useDobyStore.getState().resetStore();
  });

  it("alertBanner defaults to true", () => {
    expect(defaultFeatureFlags.alertBanner).toBe(true);
  });

  it("all flags have explicit defaults", () => {
    for (const key of Object.keys(defaultFeatureFlags)) {
      expect(typeof defaultFeatureFlags[key as keyof typeof defaultFeatureFlags]).toBe("boolean");
    }
  });

  it("toggling a flag preserves others", () => {
    useDobyStore.getState().updateFeatureFlags({ advisories: false });
    const flags = useDobyStore.getState().featureFlags;
    expect(flags.advisories).toBe(false);
    expect(flags.alertBanner).toBe(true);
    expect(flags.expenseTracker).toBe(true);
  });
});
