import { NextRequest, NextResponse } from "next/server";
import { markWorkoutCompleted, getScheduledWorkout } from "@/lib/db/workouts";
import { auth } from "@/lib/auth-better";
import { cookies } from "next/headers";

/**
 * Helper function to get user ID from session
 */
async function getUserIdFromSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("better-auth.session_token")?.value;

  if (!sessionToken) {
    return null;
  }

  const db = (auth as any).options.database;
  const session = db
    .prepare("SELECT userId FROM session WHERE token = ? AND expiresAt > ?")
    .get(sessionToken, Date.now()) as { userId: string } | undefined;

  return session?.userId || null;
}

/**
 * POST /api/workouts/complete
 * Mark a scheduled workout as completed
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, strava_activity_id } = body;

    // Validate ID
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Verify the workout belongs to the user
    const workout = getScheduledWorkout(id);

    if (!workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    if (workout.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Mark as completed
    markWorkoutCompleted(id, strava_activity_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error completing workout:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to complete workout" },
      { status: 500 }
    );
  }
}
