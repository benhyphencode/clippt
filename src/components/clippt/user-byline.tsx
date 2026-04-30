import Link from "next/link";
import { cn } from "@/lib/utils";

interface UserBylineProps {
  handle: string;
  displayName: string;
  avatarUrl?: string | null;
  /** Show identity line below name */
  identityLine?: string | null;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Disable link (e.g. when already on their profile) */
  noLink?: boolean;
  className?: string;
}

/**
 * User avatar + name display. Links to /[handle].
 * Used in SaveCards, chorus entries, profile headers, etc.
 */
export function UserByline({
  handle,
  displayName,
  avatarUrl,
  identityLine,
  size = "md",
  noLink = false,
  className,
}: UserBylineProps) {
  const sizeConfig = {
    sm: { avatar: "w-5 h-5 text-[10px]", name: "text-[13px]", identity: "text-[11px]" },
    md: { avatar: "w-7 h-7 text-[12px]", name: "text-[14px]", identity: "text-[12px]" },
    lg: { avatar: "w-10 h-10 text-[14px]", name: "text-[16px]", identity: "text-[13px]" },
  };

  const config = sizeConfig[size];

  // Generate initials from display name
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatar = avatarUrl ? (
    <img
      src={avatarUrl}
      alt=""
      className={cn("rounded-full object-cover", config.avatar)}
    />
  ) : (
    <span
      className={cn(
        "rounded-full bg-surface-alt border border-border flex items-center justify-center font-semibold text-text-muted shrink-0",
        config.avatar
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  );

  const content = (
    <span className={cn("inline-flex items-center gap-2 min-w-0", className)}>
      {avatar}
      <span className="min-w-0">
        <span className={cn("font-semibold text-text truncate block", config.name)}>
          {displayName}
        </span>
        {identityLine && (
          <span className={cn("text-text-muted truncate block", config.identity)}>
            {identityLine}
          </span>
        )}
      </span>
    </span>
  );

  if (noLink) return content;

  return (
    <Link
      href={`/${handle}`}
      className="inline-flex hover:opacity-80 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral rounded-sm"
    >
      {content}
    </Link>
  );
}
