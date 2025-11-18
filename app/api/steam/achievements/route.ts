import { NextResponse } from "next/server";
import { getRecentAchievements } from "@/lib/api/steam";
import { env } from "@/lib/env";

/**
 * GET /api/steam/achievements
 * Returns recent achievements from recently played games
 */
export async function GET() {
  try {
    // Check if Steam integration is enabled
    if (!env.ENABLE_STEAM) {
      return NextResponse.json(
        { error: "Steam integration is not enabled" },
        { status: 503 }
      );
    }

    // Check if Steam credentials are configured
    if (!env.STEAM_API_KEY || !env.STEAM_ID) {
      return NextResponse.json(
        { error: "Steam API credentials not configured" },
        { status: 500 }
      );
    }

    const achievements = await getRecentAchievements();

    return NextResponse.json({
      count: achievements.length,
      achievements,
    });
  } catch (error) {
    console.error("Error fetching recent achievements:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch recent achievements",
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 600; // 10 minutes (achievements don't change as frequently)
