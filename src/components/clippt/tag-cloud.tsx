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
  /** Enable 5-tier frequency sizing (default: true when counts present) */
  frequencySized?: boolean;
  className?: string;
}

/**
 * v2.1 Wrapped tag cloud with frequency-sized pills.
 * 5 size tiers based on count percentile, with `+N more` overflow.
 */
export function TagCloud({
  tags,
  max,
  linked = true,
  userHandle,
  frequencySized = true,
  className,
}: TagCloudProps) {
  if (tags.length === 0) return null;

  const visible = max ? tags.slice(0, max) : tags;
  const remaining = max ? tags.length - max : 0;

  // Compute size tier for each tag based on count percentile
  const counts = tags.map((t) => t.count ?? 1);
  const maxCount = Math.max(...counts);
  const minCount = Math.min(...counts);
  const range = maxCount - minCount || 1;

  function sizeFor(count: number | undefined): "sm" | "md" | "lg" {
    if (!frequencySized || count === undefined) return "md";
    const norm = (count - minCount) / range; // 0..1
    if (norm > 0.75) return "lg";
    if (norm < 0.25) return "sm";
    return "md";
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {visible.map(({ tag, count }) => {
        const pill = (
          <span className="inline-flex items-center gap-1">
            <TagPill tag={tag} size={sizeFor(count)} />
            {count !== undefined && (
              <span className="text-[11px] text-ink-3 font-medium">
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
        <span className="inline-flex items-center text-[12px] text-ink-2 font-medium px-1">
          +{remaining} more
        </span>
      )}
    </div>
  );
}
