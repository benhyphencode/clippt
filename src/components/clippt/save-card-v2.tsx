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
        "group/card relative -mx-lg px-lg py-lg rounded-[16px]",
        "border-b border-line last:border-b-0 hover:border-b-transparent",
        "transition-[background-color,box-shadow] duration-300 ease-out",
        // Bloom-from-right on hover — coloured light, not coloured paint
        "hover:bg-[radial-gradient(ellipse_500px_220px_at_94%_50%,rgba(242,92,58,0.10),transparent_72%),linear-gradient(0deg,var(--surface-alt),var(--surface-alt))]",
        "dark:hover:bg-[radial-gradient(ellipse_500px_220px_at_94%_50%,rgba(242,92,58,0.16),transparent_72%),linear-gradient(0deg,var(--surface-alt),var(--surface-alt))]",
        // Soft inset glow rim
        "hover:shadow-[inset_0_0_0_1px_rgba(242,92,58,0.18),inset_0_0_24px_rgba(242,92,58,0.04)]",
        "dark:hover:shadow-[inset_0_0_0_1px_rgba(242,92,58,0.24),inset_0_0_28px_rgba(242,92,58,0.08)]",
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
