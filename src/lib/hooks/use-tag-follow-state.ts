"use client";

import { useState, useCallback, useTransition } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { followTag, unfollowTag } from "@/lib/mutations";

interface UseTagFollowStateOptions {
  /** The current user's ID */
  currentUserId: string;
  /** The tag to follow/unfollow */
  tag: string;
  /** Initial follow state (from server-side query) */
  initialIsFollowing: boolean;
}

/**
 * Client-side hook for tag follow/unfollow state with optimistic updates.
 */
export function useTagFollowState({
  currentUserId,
  tag,
  initialIsFollowing,
}: UseTagFollowStateOptions) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  const toggle = useCallback(() => {
    const client = getSupabaseClient();
    const next = !isFollowing;

    // Optimistic update
    setIsFollowing(next);

    startTransition(async () => {
      try {
        if (next) {
          await followTag(client, currentUserId, tag);
        } else {
          await unfollowTag(client, currentUserId, tag);
        }
      } catch {
        // Revert on error
        setIsFollowing(!next);
      }
    });
  }, [isFollowing, currentUserId, tag]);

  return { isFollowing, isPending, toggle };
}
