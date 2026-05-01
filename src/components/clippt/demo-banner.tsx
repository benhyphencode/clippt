"use client";

import { useState, useEffect } from "react";

const DISMISSED_KEY = "clippt-demo-dismissed";

/**
 * Subtle demo-mode banner shown to first-time visitors.
 * Dismisses permanently via localStorage.
 */
export function DemoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if not previously dismissed
    if (!localStorage.getItem(DISMISSED_KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "1");
  };

  if (!visible) return null;

  return (
    <div className="bg-coral/8 dark:bg-coral/10 border-b border-coral/15 dark:border-coral/20">
      <div className="max-w-[1280px] mx-auto px-md sm:px-xl py-2 flex items-center justify-between gap-3">
        <p className="text-[12px] sm:text-[13px] text-text-secondary leading-snug">
          <span className="font-semibold text-coral">Demo mode</span>
          <span className="mx-1.5 text-border-strong">|</span>
          clippt is a social skill-sharing library — like del.icio.us for AI skills.
          You&apos;re browsing as{" "}
          <span className="font-semibold text-text">Ben Rowe</span>.
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 text-text-faint hover:text-text transition-colors p-1 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
          aria-label="Dismiss demo banner"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3.5 3.5l7 7M10.5 3.5l-7 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
