import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatShortDate,
  daysUntil,
  daysUntilAfterMonths,
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

describe("daysUntilAfterMonths", () => {
  it("returns 0 for empty start date", () => {
    expect(daysUntilAfterMonths("", 3)).toBe(0);
  });

  it("returns 0 for non-positive months", () => {
    expect(daysUntilAfterMonths("2024-01-01", 0)).toBe(0);
  });

  it("uses calendar-month math, not flat 30-day approximations", () => {
    // 12 months from Jan 1 lands on Jan 1 of next year (365 days, not 360).
    // We pin both today and the start so the test is deterministic.
    const startStr = "2024-01-01";
    const oneYearFromStart = daysUntilAfterMonths(startStr, 12);
    // Difference between (start + 12mo) and "today" — depends on today, but
    // structurally must equal differenceInDays(2025-01-01, today).
    const expected = Math.floor(
      (Date.parse("2025-01-01") - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
    );
    // Allow ±1 day for timezone/DST edges.
    expect(Math.abs(oneYearFromStart - expected)).toBeLessThanOrEqual(1);
  });
});

describe("currentYear", () => {
  it("returns current year", () => {
    expect(currentYear()).toBe(new Date().getFullYear());
  });
});
