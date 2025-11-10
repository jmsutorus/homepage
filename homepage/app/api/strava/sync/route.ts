import { NextRequest, NextResponse } from "next/server";
import { syncStravaData } from "@/lib/services/strava-sync";
import { auth } from "@/lib/auth";

/**
 * POST /api/strava/sync
 * Body: { full?: boolean }
 * Sync Strava activities to database
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.athleteId) {
      return NextResponse.json(
        { error: "Not authenticated with Strava" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const full = body.full === true;

    const result = await syncStravaData(full);

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
    });
  } catch (error) {
    console.error("Error in Strava sync API:", error);
    return NextResponse.json(
      { error: "Failed to sync Strava data" },
      { status: 500 }
    );
  }
}
