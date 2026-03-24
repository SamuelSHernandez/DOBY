import { describe, it, expect, beforeEach } from "vitest";
import { useDobyStore } from "@/store";
import { defaultFeatureFlags } from "@/store/defaults";

describe("useFeature fallback logic", () => {
  beforeEach(() => {
    useDobyStore.getState().resetStore();
  });

  it("temperature defaults to false", () => {
    expect(defaultFeatureFlags.temperature).toBe(false);
    expect(useDobyStore.getState().featureFlags.temperature).toBe(false);
  });

  it("humidity defaults to false", () => {
    expect(defaultFeatureFlags.humidity).toBe(false);
    expect(useDobyStore.getState().featureFlags.humidity).toBe(false);
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
    useDobyStore.getState().updateFeatureFlags({ temperature: true });
    const flags = useDobyStore.getState().featureFlags;
    expect(flags.temperature).toBe(true);
    expect(flags.humidity).toBe(false);
    expect(flags.alertBanner).toBe(true);
    expect(flags.expenseTracker).toBe(true);
  });
});
