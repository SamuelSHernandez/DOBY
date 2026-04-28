import { describe, it, expect } from "vitest";
import { getSystemLifecyclePct, getHealthVariant } from "@/lib/system-health";

describe("getSystemLifecyclePct", () => {
  it("returns 0 for empty install date", () => {
    expect(getSystemLifecyclePct("", 15)).toBe(0);
  });

  it("returns 0 for zero lifespan", () => {
    expect(getSystemLifecyclePct("2020-01-01", 0)).toBe(0);
  });

  it("returns 0 for negative lifespan", () => {
    expect(getSystemLifecyclePct("2020-01-01", -5)).toBe(0);
  });

  it("returns positive percentage for past install date", () => {
    const pct = getSystemLifecyclePct("2020-01-01", 25);
    expect(pct).toBeGreaterThan(0);
    expect(pct).toBeLessThan(100);
  });

  it("caps at 100% for very old systems", () => {
    expect(getSystemLifecyclePct("1990-01-01", 5)).toBe(100);
  });

  it("returns near-zero for recent install with long lifespan", () => {
    const recent = new Date().toISOString().slice(0, 10);
    expect(getSystemLifecyclePct(recent, 50)).toBeLessThan(1);
  });
});

describe("getHealthVariant", () => {
  it("returns nominal for 0%", () => {
    expect(getHealthVariant(0)).toBe("nominal");
  });

  it("returns nominal for 50%", () => {
    expect(getHealthVariant(50)).toBe("nominal");
  });

  it("returns caution for 51%", () => {
    expect(getHealthVariant(51)).toBe("caution");
  });

  it("returns caution for 80%", () => {
    expect(getHealthVariant(80)).toBe("caution");
  });

  it("returns critical for 81%", () => {
    expect(getHealthVariant(81)).toBe("critical");
  });

  it("returns critical for 100%", () => {
    expect(getHealthVariant(100)).toBe("critical");
  });
});
