import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatCurrencyExact,
  formatPercent,
  formatNumber,
  formatSqFt,
  formatDimensions,
} from "@/lib/formatters";

describe("formatCurrency", () => {
  it("formats whole dollars", () => {
    expect(formatCurrency(1500)).toBe("$1,500");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  it("formats large numbers", () => {
    expect(formatCurrency(350000)).toBe("$350,000");
  });
});

describe("formatCurrencyExact", () => {
  it("includes cents", () => {
    expect(formatCurrencyExact(1895.42)).toBe("$1,895.42");
  });
});

describe("formatPercent", () => {
  it("formats percentage", () => {
    expect(formatPercent(35)).toBe("35.0%");
  });
});

describe("formatNumber", () => {
  it("adds commas", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
  });
});

describe("formatSqFt", () => {
  it("calculates square footage", () => {
    expect(formatSqFt(10, 0, 12, 0)).toBe(120);
  });

  it("handles inches", () => {
    const sqft = formatSqFt(10, 3, 10, 10);
    expect(sqft).toBeGreaterThan(100);
    expect(sqft).toBeLessThan(120);
  });
});

describe("formatDimensions", () => {
  it("formats feet only", () => {
    expect(formatDimensions(12, 0)).toBe("12'");
  });

  it("formats feet and inches", () => {
    expect(formatDimensions(10, 3)).toBe("10'3\"");
  });
});
