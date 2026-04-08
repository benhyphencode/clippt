"use client";

import { getTagColours } from "@/lib/tag-colours";

interface TagSidebarProps {
  tags: { tag: string; count: number }[];
  activeTag: string | null;
  onTagClick: (tag: string) => void;
}

export function TagSidebar({ tags, activeTag, onTagClick }: TagSidebarProps) {
  return (
    <aside className="w-[250px] min-h-full border-r border-border p-lg flex-shrink-0">
      <p className="text-[10px] font-bold tracking-[0.06em] uppercase text-text-faint mb-3">
        Tags
      </p>
      <div className="flex flex-col gap-[5px]">
        {tags.map(({ tag, count }) => {
          const colours = getTagColours(tag);
          const isActive = activeTag === tag;

          return (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className="flex items-center justify-between h-[40px] px-3 rounded-[10px] text-left transition-all duration-150"
              style={{
                backgroundColor: colours.bg,
                border: isActive
                  ? `1.5px solid ${colours.text}`
                  : "1.5px solid transparent",
              }}
            >
              <span
                className="text-[13px] font-semibold"
                style={{ color: colours.text }}
              >
                {tag}
              </span>
              <span
                className="text-[11px] font-medium opacity-40"
                style={{ color: colours.text }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
