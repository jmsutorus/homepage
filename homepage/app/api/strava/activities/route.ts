import { NextRequest, NextResponse } from "next/server";
import {
  getCachedActivities,
  getCachedAthlete,
  isSyncNeeded,
} from "@/lib/services/strava-sync";
import { getActivityStats, getYTDStats } from "@/lib/db/strava";
import { getDatabase } from "@/lib/db";

/**
 * GET /api/strava/activities
 * Query params:
 * - limit: Number of activities to return (default 50)
 * - stats: Include statistics (true/false)
 * - athleteId: Optional athlete ID (defaults to most recently synced athlete)
 * - ids: Comma-separated list of activity IDs to fetch specific activities
 * Returns cached activities from database
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const includeStats = searchParams.get("stats") === "true";
    const athleteIdParam = searchParams.get("athleteId");
    const idsParam = searchParams.get("ids");

    // If specific IDs are requested, fetch those activities directly
    if (idsParam) {
      const db = getDatabase();
      const ids = idsParam.split(",").map((id) => parseInt(id.trim(), 10));
      const placeholders = ids.map(() => "?").join(",");

      const activities = db
        .prepare(`SELECT * FROM strava_activities WHERE id IN (${placeholders})`)
        .all(...ids);

      return NextResponse.json({ activities });
    }

    // Get athlete ID from query param or find the most recently synced athlete
    let athleteId: number | null = null;

    if (athleteIdParam) {
      athleteId = parseInt(athleteIdParam, 10);
    } else {
      // Get the most recently synced athlete from the database
      const db = getDatabase();
      const athlete = db
        .prepare("SELECT id FROM strava_athlete ORDER BY last_sync DESC LIMIT 1")
        .get() as { id: number } | undefined;

      if (!athlete) {
        // No athlete data found - return empty response
        return NextResponse.json({
          athlete: null,
          activities: [],
          needsSync: false,
          lastSync: null,
        });
      }

      athleteId = athlete.id;
    }

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
