"use client";

import { useFollowState } from "@/lib/hooks/use-follow-state";
import { Button } from "./button";

interface FollowButtonProps {
  currentUserId: string;
  targetUserId: string;
  initialIsFollowing: boolean;
  className?: string;
}

/**
 * v2.1 Follow/Unfollow button for users.
 * Glass+glow primary when not following; soft secondary when following.
 */
export function FollowButton({
  currentUserId,
  targetUserId,
  initialIsFollowing,
  className,
}: FollowButtonProps) {
  const { isFollowing, isPending, toggle } = useFollowState({
    currentUserId,
    targetUserId,
    initialIsFollowing,
  });

  if (currentUserId === targetUserId) return null;

  return (
    <Button
      onClick={toggle}
      disabled={isPending}
      variant={isFollowing ? "secondary" : "primary"}
      className={className}
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}
