import { NextRequest, NextResponse } from "next/server";
import {
  getCachedActivities,
  getCachedAthlete,
  isSyncNeeded,
} from "@/lib/services/strava-sync";
import { getActivityStats, getYTDStats } from "@/lib/db/strava";
import { auth } from "@/lib/auth";

/**
 * GET /api/strava/activities
 * Query params:
 * - limit: Number of activities to return (default 50)
 * - stats: Include statistics (true/false)
 * Returns cached activities from database
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.athleteId) {
      return NextResponse.json(
        { error: "Not authenticated with Strava" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const includeStats = searchParams.get("stats") === "true";

    const athleteId = session.athleteId;

    // Get cached data
    const athlete = getCachedAthlete(athleteId);
    const activities = getCachedActivities(athleteId, limit);

    // Check if sync is needed
    const needsSync = isSyncNeeded(athleteId);

    const response: any = {
      athlete,
      activities,
      needsSync,
      lastSync: athlete?.last_sync || null,
    };

    // Include statistics if requested
    if (includeStats) {
      const stats = getActivityStats(athleteId);
      const ytdStats = getYTDStats(athleteId);

      response.stats = {
        allTime: stats,
        yearToDate: ytdStats,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching Strava activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
