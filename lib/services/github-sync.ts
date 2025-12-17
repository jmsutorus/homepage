import { getGithubActivity } from "@/lib/github";
import {
  upsertGithubEvents,
  updateGithubSyncStatus,
  getGithubLastSyncTime,
  getGithubEventsByDateRange,
  getAllGithubEvents,
} from "@/lib/db/github";

export interface GithubSyncResult {
  success: boolean;
  eventsSynced: number;
  error?: string;
}

/**
 * Sync GitHub activity from API to database
 * @param accessToken - GitHub access token
 * @param userId - App user ID
 * @param full - If true, sync all available events. If false, sync from last sync time
 */
export async function syncGithubData(
  accessToken: string,
  userId: string,
  full = false
): Promise<GithubSyncResult> {
  try {
    if (!accessToken) {
      return {
        success: false,
        eventsSynced: 0,
        error: "No access token provided",
      };
    }

    // Determine date range
    let startDate: string;
    const endDate = new Date().toISOString();

    if (full) {
      // Fetch up to 1 year of data for full sync
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      startDate = oneYearAgo.toISOString();
    } else {
      // Check last sync time
      const lastSync = await getGithubLastSyncTime(userId);
      if (lastSync) {
        startDate = lastSync.toISOString();
      } else {
        // First sync - get last 90 days
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        startDate = ninetyDaysAgo.toISOString();
      }
    }

    // Fetch events from GitHub API
    const events = await getGithubActivity(accessToken, startDate, endDate);

    if (events.length === 0) {
      // Update sync status even if no events
      await updateGithubSyncStatus(userId, 0);
      return {
        success: true,
        eventsSynced: 0,
      };
    }

    // Save to database
    await upsertGithubEvents(events, userId);

    // Update sync status
    await updateGithubSyncStatus(userId, events.length);

    return {
      success: true,
      eventsSynced: events.length,
    };
  } catch (error) {
    console.error("Error syncing GitHub data:", error);
    return {
      success: false,
      eventsSynced: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get cached GitHub events from database
 */
export function getCachedGithubEvents(userId: string, limit = 100) {
  return getAllGithubEvents(userId, limit);
}

/**
 * Get cached GitHub events by date range from database
 */
export function getCachedGithubEventsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
) {
  return getGithubEventsByDateRange(userId, startDate, endDate);
}

/**
 * Check if sync is needed based on last sync time
 * @param userId - The user ID to check
 * @param intervalMinutes - The minimum interval between syncs in minutes (default 60)
 */
export async function isGithubSyncNeeded(
  userId: string,
  intervalMinutes = 60
): Promise<boolean> {
  const lastSync = await getGithubLastSyncTime(userId);

  if (!lastSync) {
    return true;
  }

  const now = new Date();
  const diffMs = now.getTime() - lastSync.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  return diffMinutes >= intervalMinutes;
}
