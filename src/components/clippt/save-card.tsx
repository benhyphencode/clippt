"use client";

import { type Resource } from "@/lib/data";
import { TagPill } from "./tag-pill";
import Link from "next/link";

interface SaveCardProps {
  resource: Resource;
  isNew?: boolean;
}

export function SaveCard({ resource, isNew }: SaveCardProps) {
  return (
    <Link href={`/resource/${resource.id}`} className="block group/card">
      <article
        className={`
          bg-surface border border-border rounded-xl p-lg
          transition-all duration-150 ease-out
          hover:-translate-x-[2px] hover:-translate-y-[2px]
          hover:shadow-[4px_4px_0_rgba(0,0,0,0.08)]
          dark:hover:shadow-[4px_4px_0_rgba(255,255,255,0.05)]
          ${isNew ? "animate-card-enter" : ""}
        `}
      >
        {/* Domain */}
        <p className="text-[12px] font-normal text-text-faint mb-1 truncate">
          {resource.domain}
        </p>

        {/* Title */}
        <h3 className="text-[18px] font-bold leading-[24px] text-text mb-2 line-clamp-2">
          {resource.title}
        </h3>

        {/* Notes */}
        {resource.notes && (
          <p className="text-[14px] leading-[22px] text-text-muted mb-3 line-clamp-2">
            {resource.notes}
          </p>
        )}

        {/* Tags */}
        {resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {resource.tags.map((tag) => (
              <TagPill key={tag} tag={tag} size="sm" />
            ))}
          </div>
        )}
      </article>
    </Link>
  );
}
