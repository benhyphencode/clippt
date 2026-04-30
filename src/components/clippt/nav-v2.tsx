import Link from "next/link";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { UserByline } from "./user-byline";

interface NavV2Props {
  currentUser: {
    handle: string;
    display_name: string;
    avatar_url: string | null;
  };
}

/**
 * v2 top navigation bar.
 * Logo (links home), search placeholder, theme toggle, profile link.
 */
export function NavV2({ currentUser }: NavV2Props) {
  return (
    <nav className="h-[56px] flex items-center justify-between px-xl border-b border-border bg-bg/80 backdrop-blur-sm sticky top-0 z-40">
      <Link
        href="/"
        className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral rounded-sm"
      >
        <Logo />
      </Link>

      <div className="flex items-center gap-3">
        {/* Search — placeholder for Phase 3 */}
        <div className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg bg-surface-alt border border-border text-text-faint text-[13px] w-[200px] cursor-not-allowed">
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

        <ThemeToggle />

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
  );
}
