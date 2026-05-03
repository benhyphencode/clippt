"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { UserByline } from "./user-byline";
import { Button } from "./button";
import { DemoPill } from "./demo-pill";
import { SaveDialogV2 } from "./save-dialog-v2";

interface NavV2Props {
  currentUser: {
    id: string;
    handle: string;
    display_name: string;
    avatar_url: string | null;
  };
}

/**
 * v2.1 top navigation bar.
 * Logo, search placeholder, demo pill, theme toggle, Clip button, profile link.
 */
export function NavV2({ currentUser }: NavV2Props) {
  const [saveOpen, setSaveOpen] = useState(false);

  return (
    <>
      <nav className="h-[56px] flex items-center justify-between px-xl border-b border-line bg-bg/80 backdrop-blur-md sticky top-0 z-40">
        <Link
          href="/"
          className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral rounded-sm"
        >
          <Logo />
        </Link>

        <div className="flex items-center gap-3">
          {/* Search — placeholder */}
          <div className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-[10px] bg-surface-alt border border-line text-ink-3 text-[13px] w-[200px] cursor-not-allowed">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="shrink-0 opacity-50"
            >
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Search...</span>
          </div>

          <DemoPill />

          <ThemeToggle />

          <Button onClick={() => setSaveOpen(true)} className="h-9 px-4">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-0.5"
              aria-hidden="true"
            >
              <path
                d="M7 1v12M1 7h12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Clip
          </Button>

          <Link
            href={`/${currentUser.handle}`}
            className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral rounded-sm"
          >
            <UserByline
              handle={currentUser.handle}
              displayName={currentUser.display_name}
              avatarUrl={currentUser.avatar_url}
              size="sm"
              noLink
            />
          </Link>
        </div>
      </nav>

      <SaveDialogV2
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        currentUserId={currentUser.id}
      />
    </>
  );
}
