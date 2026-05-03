"use client";

import { getTagColours } from "@/lib/tag-colours";
import { cn } from "@/lib/utils";

interface TagPillProps {
  tag: string;
  size?: "sm" | "md" | "lg";
  /** Active filter pill — saturated body, white text. Exception to standard glass. */
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
}

/**
 * v2.1 TagPill — liquid glass body with glowing rim.
 * Body stays constant across families; rim/glow/halo carry tag identity.
 * `active` variant: saturated body for /[user]/[tag] active filter pill.
 */
export function TagPill({
  tag,
  size = "md",
  active = false,
  onClick,
  onRemove,
  className,
}: TagPillProps) {
  const c = getTagColours(tag);

  const sizeClasses = {
    sm: "h-[22px] px-2.5 text-[11px]",
    md: "h-[24px] px-[11px] text-[11.5px]",
    lg: "h-[28px] px-3.5 text-[12.5px]",
  };

  if (active) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full font-semibold tracking-[-0.005em] text-white",
          sizeClasses[size],
          onClick && "cursor-pointer",
          className
        )}
        style={{
          backgroundColor: c.saturated,
          boxShadow: `0 0 0 1px ${c.rim}, 0 4px 16px ${c.outerHalo}`,
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
            className="ml-0.5 opacity-80 hover:opacity-100"
            aria-label={`Remove ${tag}`}
          >
            ×
          </button>
        )}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "glass-pill inline-flex items-center gap-1 rounded-full font-semibold tracking-[-0.005em] transition-all duration-150",
        sizeClasses[size],
        onClick && "cursor-pointer",
        className
      )}
      style={{
        color: c.text,
        border: `1px solid ${c.rim}`,
        boxShadow: `inset 0 0 12px ${c.innerGlow}, 0 0 0 0.5px ${c.outerHalo}`,
      }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = c.rim.replace("0.55", "0.7");
        el.style.boxShadow = `inset 0 0 12px ${c.innerGlow}, 0 0 0 0.5px ${c.outerHalo.replace("0.3", "0.45")}`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = c.rim;
        el.style.boxShadow = `inset 0 0 12px ${c.innerGlow}, 0 0 0 0.5px ${c.outerHalo}`;
      }}
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
