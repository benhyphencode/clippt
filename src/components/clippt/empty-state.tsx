"use client";

import { Button3D } from "./button-3d";

interface EmptyStateProps {
  heading?: string;
  body?: string;
  cta?: string;
  onCtaClick?: () => void;
  /** For filtered empty state — show tag name */
  filteredTag?: string;
}

export function EmptyState({
  heading = "Nothing clippt yet",
  body = "Clip your first link to start building your collection.",
  cta = "Clip your first link",
  onCtaClick,
  filteredTag,
}: EmptyStateProps) {
  if (filteredTag) {
    return (
      <div className="flex items-center justify-center py-3xl">
        <div className="text-center">
          <p className="text-[16px] font-medium text-text-muted">
            Nothing tagged &ldquo;{filteredTag}&rdquo; yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-3xl">
      <div className="border border-dashed border-border-strong rounded-xl p-xl text-center max-w-[360px]">
        <h2 className="text-[20px] font-bold text-text mb-2">{heading}</h2>
        <p className="text-[14px] text-text-muted mb-lg">{body}</p>
        {onCtaClick && (
          <Button3D onClick={onCtaClick}>{cta}</Button3D>
        )}
      </div>
    </div>
  );
}
