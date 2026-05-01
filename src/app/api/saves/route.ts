import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getSaves } from "@/lib/queries";

/**
 * GET /api/saves — paginated save fetching.
 * Query params: userId, tag, urlId, offset, limit
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const client = await createServerClient();

  const saves = await getSaves(client, {
    userId: searchParams.get("userId") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
    urlId: searchParams.get("urlId") ?? undefined,
    offset: Number(searchParams.get("offset") ?? 0),
    limit: Number(searchParams.get("limit") ?? 20),
  });

  return NextResponse.json(saves);
}
