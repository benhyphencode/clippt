import Link from "next/link";
import { cn } from "@/lib/utils";
import { UserByline } from "./user-byline";
import { TagStrip } from "./tag-strip";
import type { SaveWithDetails } from "@/lib/supabase/types";

interface SaveCardV2Props {
  save: SaveWithDetails;
  /** Hide the user byline (e.g. on a profile page where the user is obvious) */
  hideUser?: boolean;
  /** Hide the URL title (e.g. on a URL detail page where the URL is obvious) */
  hideUrl?: boolean;
  /** Entrance animation */
  isNew?: boolean;
  className?: string;
}

/**
 * v2 SaveCard — the atomic unit of the feed.
 * Shows URL title, domain, user byline, note excerpt, tags, and timestamp.
 * Links to /url/[shortId].
 */
export function SaveCardV2({
  save,
  hideUser = false,
  hideUrl = false,
  isNew = false,
  className,
}: SaveCardV2Props) {
  const timeAgo = formatRelativeTime(save.created_at);

  return (
    <article
      className={cn(
        "bg-surface border border-border rounded-xl p-lg",
        "transition-all duration-150 ease-out",
        "hover:-translate-x-[2px] hover:-translate-y-[2px]",
        "hover:shadow-[4px_4px_0_rgba(0,0,0,0.08)]",
        "dark:hover:shadow-[4px_4px_0_rgba(255,255,255,0.05)]",
        isNew && "animate-card-enter",
        className
      )}
    >
      {/* User byline */}
      {!hideUser && (
        <div className="mb-2">
          <UserByline
            handle={save.user.handle}
            displayName={save.user.display_name}
            avatarUrl={save.user.avatar_url}
            size="sm"
          />
        </div>
      )}

      {/* URL title + domain */}
      {!hideUrl && (
        <Link
          href={`/url/${save.url.short_id}`}
          className="block group/title focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral rounded-sm"
        >
          <p className="text-[12px] font-normal text-text-faint mb-0.5 truncate">
            {extractDomain(save.url.url)}
          </p>
          <h3 className="text-[17px] font-bold leading-[22px] text-text mb-1.5 line-clamp-2 group-hover/title:text-coral transition-colors">
            {save.url.title || save.url.url}
          </h3>
        </Link>
      )}

      {/* Note */}
      {save.notes && (
        <p className="text-[14px] leading-[22px] text-text-muted mb-2.5 line-clamp-3">
          {save.notes}
        </p>
      )}

      {/* Tags + timestamp */}
      <div className="flex items-end justify-between gap-3 mt-auto">
        <TagStrip tags={save.tags} max={4} size="sm" />
        <time
          dateTime={save.created_at}
          className="text-[11px] text-text-faint whitespace-nowrap shrink-0"
        >
          {timeAgo}
        </time>
      </div>
    </article>
  );
}

// ─── Helpers ──────────────────────────────────

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}
