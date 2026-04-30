"use client";

import { useFollowState } from "@/lib/hooks/use-follow-state";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  currentUserId: string;
  targetUserId: string;
  initialIsFollowing: boolean;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Follow/Unfollow button for users. Client component with optimistic updates.
 * Wired to the useFollowState hook.
 */
export function FollowButton({
  currentUserId,
  targetUserId,
  initialIsFollowing,
  size = "md",
  className,
}: FollowButtonProps) {
  const { isFollowing, isPending, toggle } = useFollowState({
    currentUserId,
    targetUserId,
    initialIsFollowing,
  });

  // Don't show follow button for yourself
  if (currentUserId === targetUserId) return null;

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
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}
