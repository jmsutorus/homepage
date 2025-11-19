"use server";

import { auth } from "@/auth";
import { getCalendarColorsObject } from "@/lib/db/calendar-colors";

/**
 * Get calendar colors for the current user as a structured object
 * Falls back to system defaults if user has no custom colors
 */
export async function getCalendarColorsForUser() {
  const session = await auth();

  if (!session?.user?.id) {
    // Return system defaults for unauthenticated users
    return getCalendarColorsObject("system");
  }

  return getCalendarColorsObject(session.user.id);
}
