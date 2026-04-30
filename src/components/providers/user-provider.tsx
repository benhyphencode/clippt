"use client";

import { createContext, useContext } from "react";
import type { User } from "@/lib/supabase/types";

const UserContext = createContext<User | null>(null);

interface UserProviderProps {
  user: User;
  children: React.ReactNode;
}

/**
 * Provides the current user to client components.
 *
 * Usage: Wrap in a Server Component that fetches the user,
 * then client components use `useCurrentUser()` to access it.
 *
 * ```tsx
 * // In a Server Component (layout or page):
 * const user = await getCurrentUser();
 * return <UserProvider user={user}>{children}</UserProvider>
 *
 * // In a Client Component:
 * const user = useCurrentUser();
 * ```
 */
export function UserProvider({ user, children }: UserProviderProps) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

/**
 * Access the current user in client components.
 * Must be used within a `<UserProvider>`.
 */
export function useCurrentUser(): User {
  const user = useContext(UserContext);
  if (!user) {
    throw new Error("useCurrentUser must be used within a UserProvider");
  }
  return user;
}
