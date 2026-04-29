import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import WishlistList from "@/components/home/WishlistList";
import { useDobyStore } from "@/store";
import { defaultMaterials } from "@/store/defaults";
import type { WishlistItem } from "@/store/types";

const room = {
  id: "r1", name: "Office", icon: "monitor", color: "#000",
  floor: "Main", widthFt: 10, widthIn: 0, heightFt: 10, heightIn: 0,
  planX: 0, planY: 0, inventory: [], wishlist: [],
  materials: { ...defaultMaterials }, systemIds: [],
};

const items: WishlistItem[] = [
  { id: "1", name: "Lamp", price: 50, url: "https://amazon.com/x", priority: "low", notes: "", vendor: "" },
  { id: "2", name: "Chair", price: 200, url: "", priority: "high", notes: "", vendor: "IKEA" },
  { id: "3", name: "Rug", price: 120, url: "https://target.com/y", priority: "medium", notes: "", vendor: "" },
];

describe("WishlistList", () => {
  beforeEach(() => {
    useDobyStore.getState().resetStore();
    useDobyStore.getState().addRoom(room);
  });

  it("renders all items with their names, prices, and priorities", () => {
    render(<WishlistList roomId="r1" items={items} />);
    expect(screen.getByText("Lamp")).toBeInTheDocument();
    expect(screen.getByText("Chair")).toBeInTheDocument();
    expect(screen.getByText("Rug")).toBeInTheDocument();
    expect(screen.getByText("$50")).toBeInTheDocument();
    expect(screen.getByText("$200")).toBeInTheDocument();
  });

  it("derives vendor from URL when no explicit vendor is set", () => {
    render(<WishlistList roomId="r1" items={items} />);
    // Each vendor name appears in the list AND the filter dropdown — getAllByText
    expect(screen.getAllByText("Amazon").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Target").length).toBeGreaterThan(0);
    expect(screen.getAllByText("IKEA").length).toBeGreaterThan(0);
  });

  it("renders empty state when no items", () => {
    render(<WishlistList roomId="r1" items={[]} />);
    expect(screen.getByText(/No wishlist items/i)).toBeInTheDocument();
  });

  it("shows external link icon only for items with a URL", () => {
    const { container } = render(<WishlistList roomId="r1" items={items} />);
    // Two items have URLs (Lamp, Rug); Chair has no URL.
    const externalLinks = container.querySelectorAll('a[href^="http"]');
    expect(externalLinks).toHaveLength(2);
  });
});
