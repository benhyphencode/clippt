import { customAlphabet } from "nanoid";
import type { Url } from "./supabase/types";

/**
 * Base62 short ID generator for /url/[id] routes.
 *
 * 8 chars from [0-9A-Za-z] = 62^8 ≈ 218 trillion combinations.
 * Opaque, URL-safe, feels designed in the address bar.
 */
const ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const ID_LENGTH = 8;
const MAX_COLLISION_RETRIES = 3;

const nanoid = customAlphabet(ALPHABET, ID_LENGTH);

export function generateShortId(): string {
  return nanoid();
}

/**
 * Extract the canonical domain from a URL.
 * Strips "www." prefix for cleaner display.
 */
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Check if a URL is a GitHub repository.
 * Returns { owner, repo } if it is, null otherwise.
 */
export function parseGitHubRepo(
  url: string
): { owner: string; repo: string } | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") return null;

    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;

    // Ignore github.com/settings, github.com/orgs, etc.
    const reservedPaths = [
      "settings",
      "orgs",
      "marketplace",
      "explore",
      "topics",
      "trending",
      "collections",
      "sponsors",
      "login",
      "signup",
      "features",
      "pricing",
      "about",
      "team",
    ];
    if (reservedPaths.includes(parts[0])) return null;

    return { owner: parts[0], repo: parts[1] };
  } catch {
    return null;
  }
}

// ─── Database operations ───────────────────────
// These use the Supabase client passed in rather than importing it,
// to avoid circular dependencies and allow server/client flexibility.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/types";

/**
 * Look up an existing URL record or create one with a new short_id.
 * Used at save time to ensure the urls table always has an entry.
 *
 * Handles nanoid collisions by retrying up to MAX_COLLISION_RETRIES times.
 */
export async function getOrCreateUrl(
  client: SupabaseClient<Database>,
  url: string,
  meta?: { title?: string; description?: string }
): Promise<Url> {
  // Check if URL already exists
  const { data: existing } = await client
    .from("urls")
    .select("*")
    .eq("url", url)
    .single();

  if (existing) return existing;

  // Create new URL record with short ID
  for (let attempt = 0; attempt < MAX_COLLISION_RETRIES; attempt++) {
    const shortId = generateShortId();

    const { data: created, error } = await client
      .from("urls")
      .insert({
        short_id: shortId,
        url,
        title: meta?.title ?? null,
        description: meta?.description ?? null,
      })
      .select("*")
      .single();

    if (created) return created;

    // If it's a unique constraint violation on short_id, retry with new ID
    if (error?.code === "23505" && error.message?.includes("short_id")) {
      continue;
    }

    // If it's a unique constraint violation on url, someone else created it
    // between our check and insert — fetch and return it
    if (error?.code === "23505" && error.message?.includes("url")) {
      const { data: raceResult } = await client
        .from("urls")
        .select("*")
        .eq("url", url)
        .single();

      if (raceResult) return raceResult;
    }

    throw new Error(`Failed to create URL record: ${error?.message}`);
  }

  throw new Error(
    `Failed to generate unique short_id after ${MAX_COLLISION_RETRIES} attempts`
  );
}

/**
 * Look up a URL record by its short_id.
 * Used by the /url/[id] route.
 */
export async function getUrlByShortId(
  client: SupabaseClient<Database>,
  shortId: string
): Promise<Url | null> {
  const { data } = await client
    .from("urls")
    .select("*")
    .eq("short_id", shortId)
    .single();

  return data;
}
