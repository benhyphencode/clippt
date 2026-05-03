"use client";

import { useTagFollowState } from "@/lib/hooks/use-tag-follow-state";
import { Button } from "./button";

interface TagFollowButtonProps {
  currentUserId: string;
  tag: string;
  initialIsFollowing: boolean;
  className?: string;
}

/**
 * v2.1 Follow/Unfollow button for tags.
 * Glass+glow primary when not following; soft secondary when following.
 */
export function TagFollowButton({
  currentUserId,
  tag,
  initialIsFollowing,
  className,
}: TagFollowButtonProps) {
  const { isFollowing, isPending, toggle } = useTagFollowState({
    currentUserId,
    tag,
    initialIsFollowing,
  });

  return (
    <Button
      onClick={toggle}
      disabled={isPending}
      variant={isFollowing ? "secondary" : "primary"}
      className={className}
    >
      {isFollowing ? "Following" : "+ Follow this tag"}
    </Button>
  );
}
