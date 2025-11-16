"use client";

import { useSession } from "next-auth/react";

/**
 * Client-side hook to access the current user session
 * Uses Auth.js session from SessionProvider
 */
export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user || null,
    session,
    isAuthenticated: !!session?.user,
    isLoading: status === "loading",
  };
}
