import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/meta?url=...
 * Scrapes the <title> from a URL for auto-populating the save form.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "clippt/1.0 (metadata scraper)",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Fetch failed: ${response.status}` },
        { status: 502 }
      );
    }

    const html = await response.text();

    // Extract <title>
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch?.[1]?.trim() ?? null;

    // Extract og:description
    const descMatch = html.match(
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i
    );
    const description = descMatch?.[1]?.trim() ?? null;

    return NextResponse.json({ title, description });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch URL metadata" },
      { status: 502 }
    );
  }
}
