"use client";

import { useTagFollowState } from "@/lib/hooks/use-tag-follow-state";
import { cn } from "@/lib/utils";

interface TagFollowButtonProps {
  currentUserId: string;
  tag: string;
  initialIsFollowing: boolean;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Follow/Unfollow button for tags. Client component with optimistic updates.
 * Wired to the useTagFollowState hook.
 */
export function TagFollowButton({
  currentUserId,
  tag,
  initialIsFollowing,
  size = "md",
  className,
}: TagFollowButtonProps) {
  const { isFollowing, isPending, toggle } = useTagFollowState({
    currentUserId,
    tag,
    initialIsFollowing,
  });

  const sizeClasses = {
    sm: "h-7 px-3 text-[12px]",
    md: "h-8 px-4 text-[13px]",
  };

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={cn(
        "rounded-lg font-semibold transition-all duration-150",
        sizeClasses[size],
        isFollowing
          ? "bg-surface-alt border border-border text-text-secondary hover:border-border-strong hover:text-text"
          : "bg-coral text-white hover:bg-coral-dark",
        isPending && "opacity-60",
        className
      )}
    >
      {isFollowing ? "Following" : "Follow tag"}
    </button>
  );
}
