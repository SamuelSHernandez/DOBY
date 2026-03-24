import { describe, it, expect } from "vitest";
import { generateId } from "@/lib/constants";
import { systemPresets, systemCategories, roomPresets } from "@/store/defaults";

describe("generateId", () => {
  it("returns a UUID string", () => {
    const id = generateId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe("systemPresets", () => {
  it("all have a scope", () => {
    for (const preset of systemPresets) {
      expect(["whole-home", "room-specific"]).toContain(preset.scope);
    }
  });

  it("all have a valid category", () => {
    const validCategories = systemCategories.map((c) => c.key);
    for (const preset of systemPresets) {
      expect(validCategories).toContain(preset.category);
    }
  });

  it("whole-home systems include HVAC, Roof, Plumbing", () => {
    const wholeHome = systemPresets.filter((p) => p.scope === "whole-home").map((p) => p.name);
    expect(wholeHome).toContain("HVAC");
    expect(wholeHome).toContain("Roof");
    expect(wholeHome).toContain("Plumbing");
  });

  it("room-specific systems include Washer, Dryer", () => {
    const roomSpecific = systemPresets.filter((p) => p.scope === "room-specific").map((p) => p.name);
    expect(roomSpecific).toContain("Washer");
    expect(roomSpecific).toContain("Dryer");
  });

  it("WiFi and AC are not room-specific", () => {
    const roomSpecific = systemPresets.filter((p) => p.scope === "room-specific").map((p) => p.name);
    expect(roomSpecific).not.toContain("Air Conditioner");
    expect(roomSpecific).not.toContain("HVAC");
  });
});

describe("roomPresets", () => {
  it("has at least 10 presets", () => {
    expect(roomPresets.length).toBeGreaterThanOrEqual(10);
  });

  it("all have name, icon, color", () => {
    for (const preset of roomPresets) {
      expect(preset.name).toBeTruthy();
      expect(preset.icon).toBeTruthy();
      expect(preset.color).toMatch(/^#/);
    }
  });
});
