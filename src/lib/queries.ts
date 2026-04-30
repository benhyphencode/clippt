/**
 * clippt v2 — Server-side query functions.
 *
 * These are the data primitives that Phase 2 pages compose from.
 * All functions take a Supabase client as the first argument to
 * stay flexible between server/client contexts.
 *
 * Canon reference: Architecture > Per-page query patterns
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  User,
  Url,
  Save,
  SaveWithDetails,
  UserFollow,
  TagFollow,
} from "./supabase/types";

type Client = SupabaseClient<Database>;

// ─── Users ─────────────────────────────────────

/** Get a single user by handle. Used by /[user] route. */
export async function getUser(
  client: Client,
  handle: string
): Promise<User | null> {
  const { data } = await client
    .from("users")
    .select("*")
    .eq("handle", handle)
    .single();
  return data;
}

/** Get a single user by ID. */
export async function getUserById(
  client: Client,
  id: string
): Promise<User | null> {
  const { data } = await client
    .from("users")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

/** Get all users. */
export async function getUsers(client: Client): Promise<User[]> {
  const { data } = await client
    .from("users")
    .select("*")
    .order("joined_at", { ascending: true });
  return data ?? [];
}

// ─── Saves ─────────────────────────────────────

export interface SaveFilters {
  userId?: string;
  userHandle?: string;
  tag?: string;
  urlId?: string;
  limit?: number;
  offset?: number;
  orderBy?: "created_at" | "updated_at";
  ascending?: boolean;
}

/**
 * Get saves with joined user and url data.
 * The primary query function — used by almost every page.
 */
export async function getSaves(
  client: Client,
  filters?: SaveFilters
): Promise<SaveWithDetails[]> {
  let query = client
    .from("saves")
    .select("*, user:users!saves_user_id_fkey(*), url:urls!saves_url_id_fkey(*)");

  if (filters?.userId) {
    query = query.eq("user_id", filters.userId);
  }

  if (filters?.userHandle) {
    query = query.eq("user.handle", filters.userHandle);
  }

  if (filters?.tag) {
    query = query.contains("tags", [filters.tag]);
  }

  if (filters?.urlId) {
    query = query.eq("url_id", filters.urlId);
  }

  const orderCol = filters?.orderBy ?? "created_at";
  const ascending = filters?.ascending ?? false;
  query = query.order(orderCol, { ascending });

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(
      filters.offset,
      filters.offset + (filters.limit ?? 50) - 1
    );
  }

  const { data } = await query;

  // Type assertion: Supabase returns joined data as nested objects
  return (data as unknown as SaveWithDetails[]) ?? [];
}

/**
 * Get a single save by ID with joined data.
 */
export async function getSaveById(
  client: Client,
  id: string
): Promise<SaveWithDetails | null> {
  const { data } = await client
    .from("saves")
    .select("*, user:users!saves_user_id_fkey(*), url:urls!saves_url_id_fkey(*)")
    .eq("id", id)
    .single();

  return (data as unknown as SaveWithDetails) ?? null;
}

// ─── URL Detail / Chorus ───────────────────────

/**
 * Get all saves for a URL (the chorus).
 * Used by /url/[id] — the cross-author chorus page.
 *
 * Canon: "The URL is the unit of content; the save is an index entry."
 */
export async function getChorusForUrl(
  client: Client,
  urlId: string
): Promise<SaveWithDetails[]> {
  return getSaves(client, { urlId, orderBy: "created_at", ascending: false });
}

/**
 * Get the cross-user tag taxonomy for a URL.
 * Aggregates all tags across all saves for this URL, with counts.
 */
export async function getUrlTagTaxonomy(
  client: Client,
  urlId: string
): Promise<{ tag: string; count: number }[]> {
  const saves = await getSaves(client, { urlId });
  const counts = new Map<string, number>();

  for (const save of saves) {
    for (const tag of save.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

// ─── Tag Queries ───────────────────────────────

/**
 * Get tag counts, optionally scoped to a user.
 * Used for tag clouds, tag sidebars, and filter dropdowns.
 */
export async function getTagCounts(
  client: Client,
  userId?: string
): Promise<{ tag: string; count: number }[]> {
  let query = client.from("saves").select("tags");

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data } = await query;
  if (!data) return [];

  const counts = new Map<string, number>();
  for (const row of data) {
    for (const tag of row.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get related tags via cross-user co-occurrence.
 * For a given tag, returns other tags that appear alongside it,
 * ranked by frequency.
 *
 * Used by /tag/[tag] sidebar.
 */
export async function getRelatedTags(
  client: Client,
  tag: string,
  limit = 10
): Promise<{ tag: string; count: number }[]> {
  const { data } = await client
    .from("saves")
    .select("tags")
    .contains("tags", [tag]);

  if (!data) return [];

  const counts = new Map<string, number>();
  for (const row of data) {
    for (const t of row.tags) {
      if (t !== tag) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
  }

  return Array.from(counts.entries())
    .map(([t, count]) => ({ tag: t, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Get top savers for a tag — users with the most saves for this tag.
 * Used by /tag/[tag] sidebar.
 */
export async function getTopSavers(
  client: Client,
  tag: string,
  limit = 5
): Promise<{ user: User; count: number }[]> {
  const saves = await getSaves(client, { tag });

  const userCounts = new Map<string, { user: User; count: number }>();
  for (const save of saves) {
    const existing = userCounts.get(save.user_id);
    if (existing) {
      existing.count++;
    } else {
      userCounts.set(save.user_id, { user: save.user, count: 1 });
    }
  }

  return Array.from(userCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// ─── Feed Queries ──────────────────────────────

/**
 * Get recent saves from people the user follows.
 * Used by / home feed "Recent in your network" column.
 */
export async function getRecentFromNetwork(
  client: Client,
  userId: string,
  limit = 30
): Promise<SaveWithDetails[]> {
  // First, get who the user follows
  const { data: follows } = await client
    .from("user_follows")
    .select("followed_id")
    .eq("follower_id", userId);

  if (!follows || follows.length === 0) return [];

  const followedIds = follows.map((f) => f.followed_id);

  // Then get recent saves from those users
  const { data } = await client
    .from("saves")
    .select("*, user:users!saves_user_id_fkey(*), url:urls!saves_url_id_fkey(*)")
    .in("user_id", followedIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data as unknown as SaveWithDetails[]) ?? [];
}

/**
 * Get popular URLs this week — top by save count in the last 7 days.
 * Used by / home feed "Popular this week" column.
 */
export async function getPopularThisWeek(
  client: Client,
  limit = 5
): Promise<
  {
    url: Url;
    saveCount: number;
    savers: User[];
  }[]
> {
  const oneWeekAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data } = await client
    .from("saves")
    .select("url_id, user:users!saves_user_id_fkey(*), url:urls!saves_url_id_fkey(*)")
    .gte("created_at", oneWeekAgo);

  if (!data) return [];

  // Group by URL and count saves
  const urlMap = new Map<
    string,
    { url: Url; saveCount: number; savers: User[] }
  >();

  for (const row of data as unknown as SaveWithDetails[]) {
    const existing = urlMap.get(row.url_id);
    if (existing) {
      existing.saveCount++;
      if (
        existing.savers.length < 5 &&
        !existing.savers.some((s) => s.id === row.user.id)
      ) {
        existing.savers.push(row.user);
      }
    } else {
      urlMap.set(row.url_id, {
        url: row.url,
        saveCount: 1,
        savers: [row.user],
      });
    }
  }

  return Array.from(urlMap.values())
    .sort((a, b) => b.saveCount - a.saveCount)
    .slice(0, limit);
}

// ─── Follows ───────────────────────────────────

/** Get users that this user follows. */
export async function getFollowing(
  client: Client,
  userId: string
): Promise<User[]> {
  const { data } = await client
    .from("user_follows")
    .select("followed:users!user_follows_followed_id_fkey(*)")
    .eq("follower_id", userId);

  if (!data) return [];
  return data.map(
    (row) => (row as unknown as { followed: User }).followed
  );
}

/** Get users that follow this user. */
export async function getFollowers(
  client: Client,
  userId: string
): Promise<User[]> {
  const { data } = await client
    .from("user_follows")
    .select("follower:users!user_follows_follower_id_fkey(*)")
    .eq("followed_id", userId);

  if (!data) return [];
  return data.map(
    (row) => (row as unknown as { follower: User }).follower
  );
}

/** Get follower + following counts for a user. */
export async function getFollowCounts(
  client: Client,
  userId: string
): Promise<{ followers: number; following: number }> {
  const [{ count: followers }, { count: following }] = await Promise.all([
    client
      .from("user_follows")
      .select("*", { count: "exact", head: true })
      .eq("followed_id", userId),
    client
      .from("user_follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId),
  ]);

  return {
    followers: followers ?? 0,
    following: following ?? 0,
  };
}

/** Check if one user follows another. */
export async function isFollowing(
  client: Client,
  followerId: string,
  followedId: string
): Promise<boolean> {
  const { data } = await client
    .from("user_follows")
    .select("id")
    .eq("follower_id", followerId)
    .eq("followed_id", followedId)
    .maybeSingle();

  return !!data;
}

/** Get tags that a user follows. */
export async function getTagFollows(
  client: Client,
  userId: string
): Promise<TagFollow[]> {
  const { data } = await client
    .from("tag_follows")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

/** Check if a user follows a tag. */
export async function isFollowingTag(
  client: Client,
  userId: string,
  tag: string
): Promise<boolean> {
  const { data } = await client
    .from("tag_follows")
    .select("id")
    .eq("user_id", userId)
    .eq("tag", tag)
    .maybeSingle();

  return !!data;
}

// ─── Save counts ───────────────────────────────

/** Get total save count for a user. */
export async function getUserSaveCount(
  client: Client,
  userId: string
): Promise<number> {
  const { count } = await client
    .from("saves")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  return count ?? 0;
}

/** Get save count for a URL (how many people saved it). */
export async function getUrlSaveCount(
  client: Client,
  urlId: string
): Promise<number> {
  const { count } = await client
    .from("saves")
    .select("*", { count: "exact", head: true })
    .eq("url_id", urlId);

  return count ?? 0;
}

/** Get total save count for a tag across all users. */
export async function getTagSaveCount(
  client: Client,
  tag: string
): Promise<number> {
  const { count } = await client
    .from("saves")
    .select("*", { count: "exact", head: true })
    .contains("tags", [tag]);

  return count ?? 0;
}

/**
 * Get the number of distinct users who have saved with a given tag.
 */
export async function getTagSaverCount(
  client: Client,
  tag: string
): Promise<number> {
  const { data } = await client
    .from("saves")
    .select("user_id")
    .contains("tags", [tag]);

  if (!data) return 0;
  const uniqueUsers = new Set(data.map((row) => row.user_id));
  return uniqueUsers.size;
}

/**
 * Get the most recent save date for a tag.
 */
export async function getTagLastSaveDate(
  client: Client,
  tag: string
): Promise<string | null> {
  const { data } = await client
    .from("saves")
    .select("created_at")
    .contains("tags", [tag])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.created_at ?? null;
}

// ─── Related saves ─────────────────────────────

/**
 * Get saves related to a URL by overlapping tags.
 * Used by /url/[id] sidebar.
 */
export async function getRelatedSaves(
  client: Client,
  urlId: string,
  limit = 8
): Promise<SaveWithDetails[]> {
  // Get tags for this URL's chorus
  const chorusTags = await getUrlTagTaxonomy(client, urlId);
  if (chorusTags.length === 0) return [];

  // Get the top 3 tags to query for
  const topTags = chorusTags.slice(0, 3).map((t) => t.tag);

  // Find saves that share at least one of these tags, excluding the source URL
  const results: SaveWithDetails[] = [];
  const seenIds = new Set<string>();

  for (const tag of topTags) {
    const saves = await getSaves(client, { tag, limit: limit * 2 });
    for (const save of saves) {
      if (save.url_id !== urlId && !seenIds.has(save.id)) {
        seenIds.add(save.id);
        results.push(save);
      }
    }
    if (results.length >= limit) break;
  }

  return results.slice(0, limit);
}
