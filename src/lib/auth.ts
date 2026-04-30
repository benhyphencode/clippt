import { createServerClient } from "./supabase/server";
import type { User } from "./supabase/types";

/**
 * Demo auth: "you are always Ben."
 *
 * Returns the current user for the demo. In v2 this is hardcoded to Ben.
 * In v3, this will read from Supabase Auth session/JWT.
 *
 * This is the ONE function to swap when adding real auth.
 */

const DEMO_USER_HANDLE = "ben-rowe";

let cachedUser: User | null = null;

/**
 * Get the current authenticated user (server-side).
 * Caches within the module for the lifetime of the request.
 */
export async function getCurrentUser(): Promise<User> {
  if (cachedUser) return cachedUser;

  const client = await createServerClient();
  const { data, error } = await client
    .from("users")
    .select("*")
    .eq("handle", DEMO_USER_HANDLE)
    .single();

  if (error || !data) {
    throw new Error(
      `Demo user "${DEMO_USER_HANDLE}" not found. Run \`supabase db reset\` to seed the database.`
    );
  }

  cachedUser = data;
  return data;
}

/**
 * Get the current user's handle (lightweight, no DB call).
 * Used where you just need the handle for queries without the full user object.
 */
export function getCurrentUserHandle(): string {
  return DEMO_USER_HANDLE;
}
