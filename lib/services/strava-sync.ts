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

export interface SyncResult {
  success: boolean;
  activitiesSynced: number;
  athleteSynced: boolean;
  athleteId?: number;
  error?: string;
}

/**
 * Sync athlete profile from Strava API to database
 */
async function syncAthlete(accessToken: string, userId: string): Promise<number | null> {
  try {
    const athlete = await getAthleteFromAPI(accessToken);
    await upsertAthlete(athlete, userId);
    return athlete.id;
  } catch (error) {
    console.error("Failed to sync athlete:", error);
    return null;
  }
}

/**
 * Sync activities from Strava API to database
 * @param accessToken - Strava access token
 * @param athleteId - The athlete ID to sync activities for
 * @param full - If true, sync all activities. If false, sync only new activities since last sync
 */
async function syncActivities(
  accessToken: string,
  athleteId: number,
  userId: string,
  full = false
): Promise<number> {
  try {
    let after: number | undefined;

    // If not a full sync, only get activities since last sync
    if (!full) {
      const lastSync = await getLastSyncTime(athleteId);
      if (lastSync) {
        // Add 1 second to avoid duplicates
        after = Math.floor(lastSync.getTime() / 1000) + 1;
      }
    }

    // Fetch activities from API
    // We'll fetch up to 200 activities at a time (Strava API limit)
    const activities = await getActivitiesFromAPI(accessToken, 1, 200, undefined, after);

    if (activities.length === 0) {
      return 0;
    }

    // Save to database
    await upsertActivities(activities, athleteId, userId);

    return activities.length;
  } catch (error) {
    console.error("Failed to sync activities:", error);
    throw error;
  }
}

/**
 * Perform a full sync of athlete and activities
 * @param accessToken - Strava access token
 * @param full - If true, sync all activities. If false, sync only new activities since last sync
 */
export async function syncStravaData(accessToken: string, userId: string, full = false): Promise<SyncResult> {
  try {
    if (!accessToken) {
      return {
        success: false,
        activitiesSynced: 0,
        athleteSynced: false,
        error: "No access token provided",
      };
    }

    // Sync athlete profile
    const athleteId = await syncAthlete(accessToken, userId);

    if (!athleteId) {
      return {
        success: false,
        activitiesSynced: 0,
        athleteSynced: false,
        error: "Failed to sync athlete profile",
      };
    }

    // Sync activities
    const activitiesSynced = await syncActivities(accessToken, athleteId, userId, full);

    return {
      success: true,
      activitiesSynced,
      athleteSynced: true,
      athleteId,
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
export async function isSyncNeeded(
  athleteId: number,
  intervalMinutes = 15
): Promise<boolean> {
  const lastSync = await getLastSyncTime(athleteId);

  if (!lastSync) {
    return true;
  }

  const now = new Date();
  const diffMs = now.getTime() - lastSync.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  return diffMinutes >= intervalMinutes;
}
