import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const DEMO_USER_HANDLE = "ben-rowe";

/**
 * Server-side Supabase client with demo auth context.
 *
 * Sets the `app.current_user_handle` session variable so RLS policies
 * know who "the current user" is. In v2 this is always "ben".
 * In v3, this will read from the Supabase Auth JWT instead.
 *
 * Use this in Server Components, API routes, and Server Actions.
 */
export async function createServerClient() {
  const client = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Set the demo auth context for RLS policies.
  // Uses the set_current_user() function defined in the migration,
  // which calls set_config('app.current_user_handle', handle, true).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (client.rpc as any)("set_current_user", { handle: DEMO_USER_HANDLE });

  return client;
}

/**
 * Server-side Supabase client without auth context.
 * Used for public reads where RLS doesn't need user context.
 */
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
