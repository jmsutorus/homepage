import { NextRequest, NextResponse } from "next/server";
import { syncStravaData } from "@/lib/services/strava-sync";
import { getUserId } from "@/lib/auth/server";

/**
 * POST /api/strava/sync
 * Body: { accessToken: string, full?: boolean }
 * Sync Strava activities to database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { accessToken, full = false } = body;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 }
      );
    }

    const userId = await getUserId();
    const result = await syncStravaData(accessToken, userId, full);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Sync failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      activitiesSynced: result.activitiesSynced,
      athleteSynced: result.athleteSynced,
      athleteId: result.athleteId,
    });
  } catch (error) {
    console.error("Error in Strava sync API:", error);
    return NextResponse.json(
      { error: "Failed to sync Strava data" },
      { status: 500 }
    );
  }
}
