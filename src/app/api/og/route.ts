import { NextResponse } from "next/server";

// Known vendor mappings from URL hostnames
const VENDOR_MAP: Record<string, string> = {
  "amazon.com": "Amazon",
  "www.amazon.com": "Amazon",
  "smile.amazon.com": "Amazon",
  "ikea.com": "IKEA",
  "www.ikea.com": "IKEA",
  "target.com": "Target",
  "www.target.com": "Target",
  "walmart.com": "Walmart",
  "www.walmart.com": "Walmart",
  "homedepot.com": "Home Depot",
  "www.homedepot.com": "Home Depot",
  "lowes.com": "Lowe's",
  "www.lowes.com": "Lowe's",
  "wayfair.com": "Wayfair",
  "www.wayfair.com": "Wayfair",
  "costco.com": "Costco",
  "www.costco.com": "Costco",
  "etsy.com": "Etsy",
  "www.etsy.com": "Etsy",
  "cb2.com": "CB2",
  "www.cb2.com": "CB2",
  "crateandbarrel.com": "Crate & Barrel",
  "www.crateandbarrel.com": "Crate & Barrel",
  "potterybarn.com": "Pottery Barn",
  "www.potterybarn.com": "Pottery Barn",
  "westelm.com": "West Elm",
  "www.westelm.com": "West Elm",
  "overstock.com": "Overstock",
  "www.overstock.com": "Overstock",
};

function extractMeta(html: string, property: string): string | null {
  // Match <meta property="og:image" content="..."> or <meta name="og:image" content="...">
  const regex = new RegExp(
    `<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']|<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`,
    "i"
  );
  const match = html.match(regex);
  return match?.[1] || match?.[2] || null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");

    // Vendor from hostname
    const vendor = VENDOR_MAP[parsed.hostname] || VENDOR_MAP[hostname] || null;

    // Fetch the page to extract OG tags
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DobyBot/1.0)",
        "Accept": "text/html",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ vendor, image: null, title: null });
    }

    // Only read first 50KB to find meta tags (they're in <head>)
    const reader = res.body?.getReader();
    let html = "";
    if (reader) {
      const decoder = new TextDecoder();
      let bytesRead = 0;
      while (bytesRead < 50000) {
        const { done, value } = await reader.read();
        if (done) break;
        html += decoder.decode(value, { stream: true });
        bytesRead += value.length;
        // Stop once we've passed </head>
        if (html.includes("</head>")) break;
      }
      reader.cancel();
    }

    const image = extractMeta(html, "og:image");
    const title = extractMeta(html, "og:title");
    const siteName = extractMeta(html, "og:site_name");

    return NextResponse.json({
      vendor: vendor || siteName || null,
      image: image || null,
      title: title || null,
    });
  } catch {
    // Timeout or network error — still return vendor from hostname if possible
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.replace(/^www\./, "");
      const vendor = VENDOR_MAP[parsed.hostname] || VENDOR_MAP[hostname] || null;
      return NextResponse.json({ vendor, image: null, title: null });
    } catch {
      return NextResponse.json({ vendor: null, image: null, title: null });
    }
  }
}
