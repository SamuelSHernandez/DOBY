import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatShortDate,
  daysUntil,
  yearsElapsed,
  yearsFractional,
  toISODate,
  currentYear,
} from "@/lib/dates";

describe("formatDate", () => {
  it("formats ISO date", () => {
    expect(formatDate("2024-03-15")).toBe("Mar 15, 2024");
  });

  it("returns dash for empty string", () => {
    expect(formatDate("")).toBe("—");
  });
});

describe("formatShortDate", () => {
  it("formats short", () => {
    expect(formatShortDate("2024-03-15")).toBe("03/15/24");
  });
});

describe("daysUntil", () => {
  it("returns negative for past dates", () => {
    expect(daysUntil("2020-01-01")).toBeLessThan(0);
  });

  it("returns positive for future dates", () => {
    expect(daysUntil("2030-01-01")).toBeGreaterThan(0);
  });

  it("returns 0 for empty string", () => {
    expect(daysUntil("")).toBe(0);
  });
});

describe("yearsElapsed", () => {
  it("returns 0 for empty string", () => {
    expect(yearsElapsed("")).toBe(0);
  });

  it("returns positive for past dates", () => {
    expect(yearsElapsed("2020-01-01")).toBeGreaterThan(0);
  });
});

describe("yearsFractional", () => {
  it("returns fractional years", () => {
    const years = yearsFractional("2020-01-01");
    expect(years).toBeGreaterThan(5);
    expect(years).toBeLessThan(8);
  });
});

describe("toISODate", () => {
  it("formats date to ISO", () => {
    const date = new Date(2024, 2, 15);
    expect(toISODate(date)).toBe("2024-03-15");
  });
});

describe("currentYear", () => {
  it("returns current year", () => {
    expect(currentYear()).toBe(new Date().getFullYear());
  });
});
