/**
 * clippt v2 — Mutation functions.
 *
 * Write operations for saves, follows, and tag follows.
 * All mutations require the demo auth context (set via createServerClient).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Save, SaveWithDetails } from "./supabase/types";
import { getOrCreateUrl } from "./url-id";

type Client = SupabaseClient<Database>;

// ─── Saves ─────────────────────────────────────

export interface CreateSaveInput {
  url: string;
  notes: string;
  tags: string[];
  /** Pre-resolved title for the URL (from /api/meta or user input) */
  title?: string;
  /** Pre-resolved description for the URL */
  description?: string;
  /** Pre-resolved og:image URL */
  ogImage?: string;
}

/**
 * Create a new save.
 * Automatically creates or finds the URL record and generates a short ID.
 */
export async function createSave(
  client: Client,
  userId: string,
  input: CreateSaveInput
): Promise<SaveWithDetails> {
  // Ensure the URL has a record in the urls table
  const urlRecord = await getOrCreateUrl(client, input.url, {
    title: input.title,
    description: input.description,
    ogImage: input.ogImage,
  });

  // Create the save
  const { data, error } = await client
    .from("saves")
    .insert({
      user_id: userId,
      url_id: urlRecord.id,
      notes: input.notes,
      tags: input.tags.map((t) => t.trim().toLowerCase()).filter(Boolean),
    })
    .select("*, user:users!saves_user_id_fkey(*), url:urls!saves_url_id_fkey(*)")
    .single();

  if (error) {
    throw new Error(`Failed to create save: ${error.message}`);
  }

  return data as unknown as SaveWithDetails;
}

export interface UpdateSaveInput {
  notes?: string;
  tags?: string[];
}

/**
 * Update an existing save (notes and/or tags only).
 * URL cannot be changed — delete and re-save instead.
 */
export async function updateSave(
  client: Client,
  saveId: string,
  input: UpdateSaveInput
): Promise<Save> {
  const updates: Database["public"]["Tables"]["saves"]["Update"] = {};

  if (input.notes !== undefined) {
    updates.notes = input.notes;
  }

  if (input.tags !== undefined) {
    updates.tags = input.tags
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
  }

  const { data, error } = await client
    .from("saves")
    .update(updates)
    .eq("id", saveId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update save: ${error.message}`);
  }

  return data;
}

/**
 * Delete a save.
 */
export async function deleteSave(
  client: Client,
  saveId: string
): Promise<void> {
  const { error } = await client.from("saves").delete().eq("id", saveId);

  if (error) {
    throw new Error(`Failed to delete save: ${error.message}`);
  }
}

// ─── User Follows ──────────────────────────────

/**
 * Follow a user. Idempotent — silently succeeds if already following.
 */
export async function followUser(
  client: Client,
  followerId: string,
  followedId: string
): Promise<void> {
  if (followerId === followedId) {
    throw new Error("Cannot follow yourself");
  }

  const { error } = await client
    .from("user_follows")
    .upsert(
      { follower_id: followerId, followed_id: followedId },
      { onConflict: "follower_id,followed_id" }
    );

  if (error) {
    throw new Error(`Failed to follow user: ${error.message}`);
  }
}

/**
 * Unfollow a user. Idempotent — silently succeeds if not following.
 */
export async function unfollowUser(
  client: Client,
  followerId: string,
  followedId: string
): Promise<void> {
  const { error } = await client
    .from("user_follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("followed_id", followedId);

  if (error) {
    throw new Error(`Failed to unfollow user: ${error.message}`);
  }
}

// ─── Tag Follows ───────────────────────────────

/**
 * Follow a tag. Idempotent — silently succeeds if already following.
 */
export async function followTag(
  client: Client,
  userId: string,
  tag: string
): Promise<void> {
  const normalised = tag.trim().toLowerCase();

  const { error } = await client
    .from("tag_follows")
    .upsert(
      { user_id: userId, tag: normalised },
      { onConflict: "user_id,tag" }
    );

  if (error) {
    throw new Error(`Failed to follow tag: ${error.message}`);
  }
}

/**
 * Unfollow a tag. Idempotent — silently succeeds if not following.
 */
export async function unfollowTag(
  client: Client,
  userId: string,
  tag: string
): Promise<void> {
  const normalised = tag.trim().toLowerCase();

  const { error } = await client
    .from("tag_follows")
    .delete()
    .eq("user_id", userId)
    .eq("tag", normalised);

  if (error) {
    throw new Error(`Failed to unfollow tag: ${error.message}`);
  }
}
