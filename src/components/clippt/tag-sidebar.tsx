"use client";

import { getTagColours } from "@/lib/tag-colours";

interface TagSidebarProps {
  tags: { tag: string; count: number }[];
  activeTag: string | null;
  onTagClick: (tag: string) => void;
  variant?: "sidebar" | "strip";
}

export function TagSidebar({ tags, activeTag, onTagClick, variant = "sidebar" }: TagSidebarProps) {
  if (variant === "strip") {
    return (
      <div className="flex gap-2 px-md py-sm overflow-x-auto border-b border-border scrollbar-none">
        {tags.map(({ tag, count }) => {
          const colours = getTagColours(tag);
          const isActive = activeTag === tag;

          return (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className="flex items-center gap-1.5 h-[32px] px-2.5 rounded-lg whitespace-nowrap flex-shrink-0 transition-all duration-150 text-[12px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
              style={{
                backgroundColor: colours.bg,
                color: colours.text,
                border: isActive
                  ? `1.5px solid ${colours.text}`
                  : "1.5px solid transparent",
              }}
            >
              {tag}
              <span className="opacity-40 text-[11px]">{count}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <aside className="w-[250px] min-h-full border-r border-border p-lg flex-shrink-0">
      <p className="text-[10px] font-bold tracking-[0.06em] uppercase text-text-faint mb-3">
        Tags
      </p>
      <div className="flex flex-col gap-1.5">
        {tags.map(({ tag, count }) => {
          const colours = getTagColours(tag);
          const isActive = activeTag === tag;

          return (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className="flex items-center justify-between h-[40px] px-3 rounded-lg text-left transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
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
