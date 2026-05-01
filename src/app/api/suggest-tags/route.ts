import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * POST /api/suggest-tags
 * Uses Claude Haiku to suggest tags for a URL being saved.
 * Gracefully returns empty array if ANTHROPIC_API_KEY is not set.
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ tags: [] });
  }

  try {
    const { url, title, notes } = await request.json();

    if (!url && !title) {
      return NextResponse.json({ tags: [] });
    }

    // Fetch top tags from DB for vocabulary convergence
    const client = await createServerClient();
    const { data: topTags } = await client
      .from("saves")
      .select("tags");

    // Count tag frequency
    const tagCounts = new Map<string, number>();
    for (const row of topTags ?? []) {
      for (const tag of row.tags ?? []) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }
    const vocabulary = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([tag]) => tag);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20250414",
        max_tokens: 150,
        messages: [
          {
            role: "user",
            content: `You are a tag suggestion engine for a skill-sharing library called clippt.

Given a URL being saved, suggest 3-5 short kebab-case tags that describe the skills, topics, or themes. Prefer tags from the existing vocabulary when they fit.

Existing tag vocabulary: ${vocabulary.join(", ")}

URL: ${url}
Title: ${title || "unknown"}
${notes ? `Notes: ${notes}` : ""}

Return ONLY a JSON array of tag strings, e.g. ["design-tools", "craft", "field-notes"]. No other text.`,
          },
        ],
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.error("Anthropic API error:", response.status);
      return NextResponse.json({ tags: [] });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text ?? "[]";

    // Parse the JSON array from the response
    const match = content.match(/\[[\s\S]*\]/);
    if (!match) {
      return NextResponse.json({ tags: [] });
    }

    const suggestedTags: string[] = JSON.parse(match[0]);
    const cleanTags = suggestedTags
      .map((t: string) => t.trim().toLowerCase())
      .filter((t: string) => t.length > 0 && t.length < 40)
      .slice(0, 5);

    return NextResponse.json({ tags: cleanTags });
  } catch (err) {
    console.error("Tag suggestion error:", err);
    return NextResponse.json({ tags: [] });
  }
}
