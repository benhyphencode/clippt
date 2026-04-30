import Link from "next/link";
import { TagPill } from "./tag-pill";
import { cn } from "@/lib/utils";

interface TagCloudProps {
  /** Tags with optional counts */
  tags: { tag: string; count?: number }[];
  /** Max tags to show */
  max?: number;
  /** Link tags to /tag/[tag] or /[user]/[tag] */
  linked?: boolean;
  /** If set, links go to /[userHandle]/[tag] instead of /tag/[tag] */
  userHandle?: string;
  className?: string;
}

/**
 * Wrapped tag cloud with counts. Used on profile pages, tag pages, sidebars.
 * Tags are displayed in a wrapping flex layout (vs TagStrip which is inline).
 */
export function TagCloud({
  tags,
  max,
  linked = true,
  userHandle,
  className,
}: TagCloudProps) {
  if (tags.length === 0) return null;

  const visible = max ? tags.slice(0, max) : tags;
  const remaining = max ? tags.length - max : 0;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {visible.map(({ tag, count }) => {
        const pill = (
          <span className="inline-flex items-center gap-1">
            <TagPill tag={tag} size="md" />
            {count !== undefined && (
              <span className="text-[11px] text-text-faint font-medium">
                {count}
              </span>
            )}
          </span>
        );

        if (!linked) return <span key={tag}>{pill}</span>;

        return (
          <Link
            key={tag}
            href={userHandle ? `/${userHandle}/${tag}` : `/tag/${tag}`}
            className="hover:opacity-80 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-coral rounded-md"
          >
            {pill}
          </Link>
        );
      })}
      {remaining > 0 && (
        <span className="inline-flex items-center text-[12px] text-text-muted font-medium px-1">
          +{remaining} more
        </span>
      )}
    </div>
  );
}
