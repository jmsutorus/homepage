import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Get the current session (optional - returns null if not authenticated)
 */
export async function getSession() {
  return await auth();
}

/**
 * Require authentication - throws error/redirects if not authenticated
 * Use this in Server Components and API routes that require auth
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return session;
}

/**
 * Get the authenticated user's ID
 * Throws error if not authenticated
 */
export async function getUserId(): Promise<string> {
  const session = await requireAuth();
  return session.user.id;
}

/**
 * Get the authenticated user
 * Returns user object or null if not authenticated
 */
export async function getUser() {
  const session = await auth();
  return session?.user || null;
}

/**
 * Require admin role - throws error/redirects if not admin
 */
export async function requireAdmin() {
  const session = await requireAuth();

  if (session.user.role !== "admin") {
    redirect("/");
  }

  return session;
}
