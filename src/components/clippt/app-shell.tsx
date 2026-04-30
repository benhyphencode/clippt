import { NavV2 } from "./nav-v2";
import type { User } from "@/lib/supabase/types";

interface AppShellProps {
  currentUser: User;
  children: React.ReactNode;
}

/**
 * v2 app shell — nav bar + main content area.
 * Wraps all pages with consistent layout.
 * Server Component: receives currentUser from layout.
 */
export function AppShell({ currentUser, children }: AppShellProps) {
  return (
    <>
      <NavV2
        currentUser={{
          handle: currentUser.handle,
          display_name: currentUser.display_name,
          avatar_url: currentUser.avatar_url,
        }}
      />
      <main
        id="main-content"
        className="flex-1 w-full max-w-[1280px] mx-auto px-md sm:px-xl py-lg sm:py-xl"
      >
        {children}
      </main>
    </>
  );
}
