import { NextRequest, NextResponse } from "next/server";
import {
  createWorkoutActivity,
  getAllWorkoutActivities,
  updateWorkoutActivity,
  deleteWorkoutActivity,
  getWorkoutActivitiesByDateRange,
  markWorkoutActivityCompleted,
  getWorkoutActivity,
  type CreateWorkoutActivity,
} from "@/lib/db/workout-activities";
import { requireAuthApi } from "@/lib/auth/server";
import { cookies } from "next/headers";
import { scheduleWorkoutNotifications, cancelWorkoutNotifications } from "@/lib/firebase/notifications";

/**
 * GET /api/activities
 * Get all workout activities or filter by date range
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    let activities;
    if (startDate && endDate) {
      activities = await getWorkoutActivitiesByDateRange(startDate, endDate, userId);
    } else {
      activities = await getAllWorkoutActivities(userId);
    }

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error getting workout activities:", error);
    return NextResponse.json(
      { error: "Failed to get workout activities" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/activities
 * Create a new workout activity
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await request.json();
    const { date, time, length, difficulty, type, exercises, notes, completed, distance } = body;

    // Validate required fields
    if (!date || !time || !length || !type || !exercises) {
      return NextResponse.json(
        { error: "date, time, length, type, and exercises are required" },
        { status: 400 }
      );
    }

    // Validate exercises is an array
    if (!Array.isArray(exercises)) {
      return NextResponse.json(
        { error: "exercises must be an array" },
        { status: 400 }
      );
    }

    const activity: CreateWorkoutActivity = {
      date,
      time,
      length,
      distance,
      difficulty: difficulty || "moderate",
      type,
      exercises,
      notes,
      completed,
    };

    const activityId = await createWorkoutActivity(activity, userId);

    try {
      const cookieStore = await cookies();
      const timezoneOffset = cookieStore.get("timezone-offset")?.value || "+00:00";
      await scheduleWorkoutNotifications(
        { id: activityId, date, time, type, completed },
        userId,
        timezoneOffset
      );
    } catch (e) {
      console.error("Failed to schedule notifications for new workout:", e);
    }

    return NextResponse.json({ success: true, id: activityId });
  } catch (error) {
    console.error("Error creating workout activity:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create workout activity" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/activities
 * Update a workout activity
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await request.json();
    const { id, ...updates } = body;

    // Validate ID
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Update workout activity
    await updateWorkoutActivity(id, userId, updates);

    try {
      await cancelWorkoutNotifications(id, userId);
      const updatedWorkout = await getWorkoutActivity(id, userId);
      if (updatedWorkout) {
        const cookieStore = await cookies();
        const timezoneOffset = cookieStore.get("timezone-offset")?.value || "+00:00";
        await scheduleWorkoutNotifications(
          {
            id: updatedWorkout.id,
            date: updatedWorkout.date,
            time: updatedWorkout.time,
            type: updatedWorkout.type,
            completed: !!updatedWorkout.completed
          },
          userId,
          timezoneOffset
        );
      }
    } catch (e) {
      console.error("Failed to update notifications for workout:", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating workout activity:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update workout activity" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/activities
 * Mark a workout activity as completed
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await request.json();
    const { id, completion_notes } = body;

    // Validate ID
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Mark workout activity as completed
    await markWorkoutActivityCompleted(id, userId, completion_notes);

    try {
      await cancelWorkoutNotifications(id, userId);
    } catch (e) {
      console.error("Failed to cancel notifications for completed workout:", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking workout activity as complete:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to mark activity as complete" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/activities
 * Delete a workout activity
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // Validate ID
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Delete workout activity
    await deleteWorkoutActivity(parseInt(id), userId);

    try {
      await cancelWorkoutNotifications(parseInt(id), userId);
    } catch (e) {
      console.error("Failed to cancel notifications for deleted workout:", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workout activity:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete workout activity" },
      { status: 500 }
    );
  }
}
