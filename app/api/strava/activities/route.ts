import { NextRequest, NextResponse } from "next/server";
import {
  getCachedActivities,
  getCachedAthlete,
  isSyncNeeded,
} from "@/lib/services/strava-sync";
import { getActivityStats, getYTDStats } from "@/lib/db/strava";
import { getDatabase } from "@/lib/db";
import { auth } from "@/auth";
import { cookies } from "next/headers";

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
    // Get user session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from session
    const db = (auth as any).options.database;
    const session = db
      .prepare("SELECT userId FROM session WHERE token = ? AND expiresAt > ?")
      .get(sessionToken, Date.now()) as { userId: string } | undefined;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId;

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
        .prepare(`SELECT * FROM strava_activities WHERE id IN (${placeholders}) AND userId = ?`)
        .all(...ids, userId);

      return NextResponse.json({ activities });
    }

    // Get athlete ID from query param or find the most recently synced athlete for this user
    let athleteId: number | null = null;

    if (athleteIdParam) {
      athleteId = parseInt(athleteIdParam, 10);

      // Verify the athlete belongs to this user
      const db = getDatabase();
      const athlete = db
        .prepare("SELECT id FROM strava_athlete WHERE id = ? AND userId = ?")
        .get(athleteId, userId) as { id: number } | undefined;

      if (!athlete) {
        return NextResponse.json(
          { error: "Athlete not found or access denied" },
          { status: 403 }
        );
      }
    } else {
      // Get the most recently synced athlete for this user from the database
      const db = getDatabase();
      const athlete = db
        .prepare("SELECT id FROM strava_athlete WHERE userId = ? ORDER BY last_sync DESC LIMIT 1")
        .get(userId) as { id: number } | undefined;

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
