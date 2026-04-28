import { describe, it, expect, vi, afterEach } from "vitest";
import { getSeasonalNote } from "@/lib/seasonal";

describe("getSeasonalNote", () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it("returns an object with label, title, description", () => {
    const note = getSeasonalNote();
    expect(note).toHaveProperty("label");
    expect(note).toHaveProperty("title");
    expect(note).toHaveProperty("description");
    expect(note.label).toBe("Seasonal");
  });

  it("returns spring for March", () => {
    vi.spyOn(Date.prototype, "getMonth").mockReturnValue(2);
    expect(getSeasonalNote().title).toContain("Spring");
  });

  it("returns spring for May", () => {
    vi.spyOn(Date.prototype, "getMonth").mockReturnValue(4);
    expect(getSeasonalNote().title).toContain("Spring");
  });

  it("returns summer for June", () => {
    vi.spyOn(Date.prototype, "getMonth").mockReturnValue(5);
    expect(getSeasonalNote().title).toContain("Summer");
  });

  it("returns fall for September", () => {
    vi.spyOn(Date.prototype, "getMonth").mockReturnValue(8);
    expect(getSeasonalNote().title).toContain("Fall");
  });

  it("returns winter for January", () => {
    vi.spyOn(Date.prototype, "getMonth").mockReturnValue(0);
    expect(getSeasonalNote().title).toContain("Winter");
  });

  it("returns winter for December", () => {
    vi.spyOn(Date.prototype, "getMonth").mockReturnValue(11);
    expect(getSeasonalNote().title).toContain("Winter");
  });
});
