import { describe, it, expect } from "vitest";
import {
  calculateMonthlyPayment,
  calculateTotalMonthly,
  generateAmortizationSchedule,
  calculateHomeValue,
  calculateEquity,
} from "@/lib/mortgage";

describe("calculateMonthlyPayment", () => {
  it("returns 0 for zero principal", () => {
    expect(calculateMonthlyPayment(0, 6.5, 30)).toBe(0);
  });

  it("returns 0 for zero rate", () => {
    expect(calculateMonthlyPayment(300000, 0, 30)).toBe(0);
  });

  it("calculates correctly for typical mortgage", () => {
    const payment = calculateMonthlyPayment(300000, 6.5, 30);
    expect(payment).toBeGreaterThan(1890);
    expect(payment).toBeLessThan(1900);
  });

  it("higher rate means higher payment", () => {
    const low = calculateMonthlyPayment(300000, 5, 30);
    const high = calculateMonthlyPayment(300000, 7, 30);
    expect(high).toBeGreaterThan(low);
  });
});

describe("calculateTotalMonthly", () => {
  it("sums all components", () => {
    const total = calculateTotalMonthly(1500, 6000, 2400, 100);
    expect(total).toBe(1500 + 500 + 200 + 100);
  });
});

describe("generateAmortizationSchedule", () => {
  it("returns empty for invalid inputs", () => {
    expect(generateAmortizationSchedule(0, 5, 30)).toEqual([]);
  });

  it("generates 360 rows for 30-year mortgage", () => {
    const schedule = generateAmortizationSchedule(300000, 6.5, 30);
    expect(schedule.length).toBe(360);
  });

  it("balance reaches zero at end", () => {
    const schedule = generateAmortizationSchedule(300000, 6.5, 30);
    expect(schedule[schedule.length - 1].balance).toBeLessThan(1);
  });

  it("total principal equals loan amount", () => {
    const schedule = generateAmortizationSchedule(300000, 6.5, 30);
    const totalPrincipal = schedule[schedule.length - 1].totalPrincipal;
    expect(Math.round(totalPrincipal)).toBe(300000);
  });
});

describe("calculateHomeValue", () => {
  it("returns purchase price at year 0", () => {
    expect(calculateHomeValue(300000, 3.5, 0)).toBe(300000);
  });

  it("appreciates over time", () => {
    const value = calculateHomeValue(300000, 3.5, 5);
    expect(value).toBeGreaterThan(300000);
  });

  it("calculates compound appreciation", () => {
    const value = calculateHomeValue(300000, 3.5, 1);
    expect(Math.round(value)).toBe(310500);
  });
});

describe("calculateEquity", () => {
  it("returns down payment at month 0", () => {
    const equity = calculateEquity(300000, 250000, [], 0);
    expect(equity).toBe(50000);
  });

  it("increases over time", () => {
    const schedule = generateAmortizationSchedule(250000, 6.5, 30);
    const early = calculateEquity(300000, 250000, schedule, 12);
    const later = calculateEquity(300000, 250000, schedule, 120);
    expect(later).toBeGreaterThan(early);
  });
});
