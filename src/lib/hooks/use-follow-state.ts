"use client";

import { useState, useCallback, useTransition } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { followUser, unfollowUser } from "@/lib/mutations";

interface UseFollowStateOptions {
  /** The current user's ID */
  currentUserId: string;
  /** The target user's ID to follow/unfollow */
  targetUserId: string;
  /** Initial follow state (from server-side query) */
  initialIsFollowing: boolean;
}

/**
 * Client-side hook for follow/unfollow state with optimistic updates.
 */
export function useFollowState({
  currentUserId,
  targetUserId,
  initialIsFollowing,
}: UseFollowStateOptions) {
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
          await followUser(client, currentUserId, targetUserId);
        } else {
          await unfollowUser(client, currentUserId, targetUserId);
        }
      } catch {
        // Revert on error
        setIsFollowing(!next);
      }
    });
  }, [isFollowing, currentUserId, targetUserId]);

  return { isFollowing, isPending, toggle };
}
