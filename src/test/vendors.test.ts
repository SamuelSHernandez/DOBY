import { describe, it, expect } from "vitest";
import { vendorFromUrl } from "@/lib/vendors";

describe("vendorFromUrl", () => {
  it("matches direct hostnames", () => {
    expect(vendorFromUrl("https://www.amazon.com/dp/123")).toBe("Amazon");
    expect(vendorFromUrl("https://homedepot.com/p/456")).toBe("Home Depot");
    expect(vendorFromUrl("https://www.lowes.com/")).toBe("Lowe's");
  });

  it("strips www. and smile. subdomain prefixes", () => {
    expect(vendorFromUrl("https://www.ikea.com")).toBe("IKEA");
    expect(vendorFromUrl("https://smile.amazon.com/dp/123")).toBe("Amazon");
  });

  it("falls back to last two domain parts for other subdomains", () => {
    expect(vendorFromUrl("https://m.ikea.com/products")).toBe("IKEA");
    expect(vendorFromUrl("https://shop.target.com/")).toBe("Target");
  });

  it("returns null for unknown hosts", () => {
    expect(vendorFromUrl("https://random-shop.example/x")).toBeNull();
  });

  it("returns null for invalid URLs without throwing", () => {
    expect(vendorFromUrl("not a url")).toBeNull();
    expect(vendorFromUrl("")).toBeNull();
  });

  it("recognizes the alias rh.com → RH", () => {
    expect(vendorFromUrl("https://rh.com/catalog")).toBe("RH");
    expect(vendorFromUrl("https://www.restorationhardware.com/")).toBe("RH");
  });
});
