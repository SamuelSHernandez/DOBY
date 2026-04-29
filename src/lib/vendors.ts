const VENDOR_HOSTS: Record<string, string> = {
  "amazon.com": "Amazon",
  "ikea.com": "IKEA",
  "target.com": "Target",
  "walmart.com": "Walmart",
  "homedepot.com": "Home Depot",
  "lowes.com": "Lowe's",
  "wayfair.com": "Wayfair",
  "costco.com": "Costco",
  "etsy.com": "Etsy",
  "cb2.com": "CB2",
  "crateandbarrel.com": "Crate & Barrel",
  "potterybarn.com": "Pottery Barn",
  "westelm.com": "West Elm",
  "overstock.com": "Overstock",
  "bedbathandbeyond.com": "Bed Bath & Beyond",
  "acehardware.com": "Ace Hardware",
  "menards.com": "Menards",
  "rejuvenation.com": "Rejuvenation",
  "restorationhardware.com": "RH",
  "rh.com": "RH",
  "pier1.com": "Pier 1",
  "worldmarket.com": "World Market",
  "zgallerie.com": "Z Gallerie",
  "anthropologie.com": "Anthropologie",
  "urbanoutfitters.com": "Urban Outfitters",
  "allmodern.com": "AllModern",
  "jossandmain.com": "Joss & Main",
  "birchlane.com": "Birch Lane",
  "hayneedle.com": "Hayneedle",
  "build.com": "Build.com",
  "fergusons.com": "Ferguson",
  "lumens.com": "Lumens",
  "ylighting.com": "YLighting",
  "ebay.com": "eBay",
  "bestbuy.com": "Best Buy",
  "samsclub.com": "Sam's Club",
};

export function vendorFromUrl(url: string): string | null {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "").replace(/^smile\./, "");
    if (VENDOR_HOSTS[hostname]) return VENDOR_HOSTS[hostname];
    const parts = hostname.split(".");
    const domain = parts.slice(-2).join(".");
    return VENDOR_HOSTS[domain] || null;
  } catch {
    return null;
  }
}
