import {
  getAthlete as getAthleteFromAPI,
  getActivities as getActivitiesFromAPI,
} from "@/lib/api/strava";
import {
  upsertAthlete,
  upsertActivities,
  getAthlete,
  getActivities,
  getLastSyncTime,
} from "@/lib/db/strava";
import { auth } from "@/lib/auth";

export interface SyncResult {
  success: boolean;
  activitiesSynced: number;
  athleteSynced: boolean;
  error?: string;
}

/**
 * Sync athlete profile from Strava API to database
 */
async function syncAthlete(): Promise<boolean> {
  try {
    const athlete = await getAthleteFromAPI();
    upsertAthlete(athlete);
    return true;
  } catch (error) {
    console.error("Failed to sync athlete:", error);
    return false;
  }
}

/**
 * Sync activities from Strava API to database
 * @param athleteId - The athlete ID to sync activities for
 * @param full - If true, sync all activities. If false, sync only new activities since last sync
 */
async function syncActivities(
  athleteId: number,
  full = false
): Promise<number> {
  try {
    let after: number | undefined;

    // If not a full sync, only get activities since last sync
    if (!full) {
      const lastSync = getLastSyncTime(athleteId);
      if (lastSync) {
        // Add 1 second to avoid duplicates
        after = Math.floor(lastSync.getTime() / 1000) + 1;
      }
    }

    // Fetch activities from API
    // We'll fetch up to 200 activities at a time (Strava API limit)
    const activities = await getActivitiesFromAPI(1, 200, undefined, after);

    if (activities.length === 0) {
      return 0;
    }

    // Save to database
    upsertActivities(activities, athleteId);

    return activities.length;
  } catch (error) {
    console.error("Failed to sync activities:", error);
    throw error;
  }
}

/**
 * Perform a full sync of athlete and activities
 * @param full - If true, sync all activities. If false, sync only new activities since last sync
 */
export async function syncStravaData(full = false): Promise<SyncResult> {
  try {
    const session = await auth();

    if (!session?.athleteId) {
      return {
        success: false,
        activitiesSynced: 0,
        athleteSynced: false,
        error: "No authenticated athlete found",
      };
    }

    // Sync athlete profile
    const athleteSynced = await syncAthlete();

    if (!athleteSynced) {
      return {
        success: false,
        activitiesSynced: 0,
        athleteSynced: false,
        error: "Failed to sync athlete profile",
      };
    }

    // Sync activities
    const activitiesSynced = await syncActivities(session.athleteId, full);

    return {
      success: true,
      activitiesSynced,
      athleteSynced: true,
    };
  } catch (error) {
    console.error("Error syncing Strava data:", error);
    return {
      success: false,
      activitiesSynced: 0,
      athleteSynced: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get cached activities from database
 * This avoids hitting the Strava API rate limits
 */
export function getCachedActivities(athleteId: number, limit = 50) {
  return getActivities(athleteId, limit);
}

/**
 * Get athlete from database
 */
export function getCachedAthlete(athleteId: number) {
  return getAthlete(athleteId);
}

/**
 * Check if sync is needed based on last sync time
 * @param athleteId - The athlete ID to check
 * @param intervalMinutes - The minimum interval between syncs in minutes (default 15)
 */
export function isSyncNeeded(
  athleteId: number,
  intervalMinutes = 15
): boolean {
  const lastSync = getLastSyncTime(athleteId);

  if (!lastSync) {
    return true;
  }

  const now = new Date();
  const diffMs = now.getTime() - lastSync.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  return diffMinutes >= intervalMinutes;
}
