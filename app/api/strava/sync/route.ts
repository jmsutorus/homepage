import { NextRequest, NextResponse } from "next/server";
import { syncStravaData } from "@/lib/services/strava-sync";
import { requireAuthApi } from "@/lib/auth/server";

/**
 * POST /api/strava/sync
 * Body: { accessToken: string, full?: boolean }
 * Sync Strava activities to database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { full = false } = body;
    let token = body.accessToken;

    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // If no token provided, try to get from database
    if (!token) {
      try {
        const { getValidStravaToken } = await import("@/lib/auth/strava-token");
        token = await getValidStravaToken(userId);
      } catch (error) {
        return NextResponse.json(
          { error: "Strava account not connected or token expired" },
          { status: 400 }
        );
      }
    }

    const result = await syncStravaData(token, userId, full);

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
