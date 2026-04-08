"use client";

import { getTagColours } from "@/lib/tag-colours";
import { cn } from "@/lib/utils";

interface TagPillProps {
  tag: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
}

export function TagPill({ tag, size = "md", onClick, onRemove, className }: TagPillProps) {
  const colours = getTagColours(tag);

  const sizeClasses = {
    sm: "h-[22px] px-2 text-[11px]",
    md: "h-[26px] px-2.5 text-[11px]",
    lg: "h-[28px] px-3 text-[12px]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md font-semibold transition-transform duration-200",
        sizeClasses[size],
        onClick && "cursor-pointer hover:scale-105",
        className
      )}
      style={{
        backgroundColor: colours.bg,
        color: colours.text,
        border: `1px solid ${colours.borderColor}`,
      }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      {tag}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
          aria-label={`Remove ${tag}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
