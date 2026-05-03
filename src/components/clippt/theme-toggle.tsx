"use client";

import { useEffect, useState } from "react";

/**
 * v2.1 ThemeToggle — secondary-button style icon button.
 * Uses data-theme attribute on <html>, persists in localStorage as 'clippt-theme'.
 * Initial state set by inline script in layout.tsx (no FOUC).
 */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.add("theme-transition");
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("clippt-theme", next ? "dark" : "light");
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 350);
  };

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 flex items-center justify-center rounded-[10px] text-ink-2 hover:text-ink bg-surface-alt hover:shadow-[0_2px_8px_rgba(0,0,0,0.18)] dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.18)] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M13.36 10.06A6 6 0 015.94 2.64 6 6 0 1013.36 10.06z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
