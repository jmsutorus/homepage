"use server";

import { auth } from "@/auth";
import { getCalendarColorsObject, ensureUserColorsExist } from "@/lib/db/calendar-colors";

/**
 * Get calendar colors for the current user as a structured object
 * Falls back to system defaults if user has no custom colors
 * Automatically populates user colors from defaults on first access
 */
export async function getCalendarColorsForUser() {
  const session = await auth();

  if (!session?.user?.id) {
    // Return system defaults for unauthenticated users
    return getCalendarColorsObject("system");
  }

  // Ensure user has colors populated (auto-populate from defaults if not)
  ensureUserColorsExist(session.user.id);

  return getCalendarColorsObject(session.user.id);
}
