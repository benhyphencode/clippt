import Link from "next/link";
import { TagPill } from "./tag-pill";
import { cn } from "@/lib/utils";

interface TagStripProps {
  tags: string[];
  /** Max tags to show before "+N more" */
  max?: number;
  /** Size passed to TagPill */
  size?: "sm" | "md" | "lg";
  /** Link tags to /tag/[tag] (default true) */
  linked?: boolean;
  /** Link tags to /[user]/[tag] instead of /tag/[tag] */
  userHandle?: string;
  className?: string;
}

/**
 * Inline horizontal tag list. Tags link to their tag page.
 * Used in SaveCards and compact contexts.
 */
export function TagStrip({
  tags,
  max,
  size = "sm",
  linked = true,
  userHandle,
  className,
}: TagStripProps) {
  if (tags.length === 0) return null;

  const visible = max ? tags.slice(0, max) : tags;
  const remaining = max ? tags.length - max : 0;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {visible.map((tag) =>
        linked ? (
          <Link
            key={tag}
            href={userHandle ? `/${userHandle}/${tag}` : `/tag/${tag}`}
            className="focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-coral rounded-md"
          >
            <TagPill tag={tag} size={size} />
          </Link>
        ) : (
          <TagPill key={tag} tag={tag} size={size} />
        )
      )}
      {remaining > 0 && (
        <span className="inline-flex items-center text-[11px] text-text-muted font-medium px-1">
          +{remaining} more
        </span>
      )}
    </div>
  );
}
