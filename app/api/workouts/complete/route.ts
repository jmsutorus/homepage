import { NextRequest, NextResponse } from "next/server";
import { markWorkoutCompleted, getScheduledWorkout } from "@/lib/db/workouts";
import { requireAuthApi } from "@/lib/auth/server";

/**
 * POST /api/workouts/complete
 * Mark a scheduled workout as completed
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const { id, strava_activity_id } = body;

    // Validate ID
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Verify the workout belongs to the user
    const workout = await getScheduledWorkout(id, userId);

    if (!workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    if (workout.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Mark as completed
    await markWorkoutCompleted(id, userId, strava_activity_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error completing workout:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to complete workout" },
      { status: 500 }
    );
  }
}
