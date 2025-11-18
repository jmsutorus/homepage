import { NextRequest, NextResponse } from "next/server";
import {
  createWorkoutActivity,
  getAllWorkoutActivities,
  updateWorkoutActivity,
  deleteWorkoutActivity,
  getWorkoutActivitiesByDateRange,
  markWorkoutActivityCompleted,
  type CreateWorkoutActivity,
} from "@/lib/db/workout-activities";

/**
 * GET /api/activities
 * Get all workout activities or filter by date range
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    let activities;
    if (startDate && endDate) {
      activities = getWorkoutActivitiesByDateRange(startDate, endDate);
    } else {
      activities = getAllWorkoutActivities();
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
    const body = await request.json();
    const { date, time, length, difficulty, type, exercises, notes } = body;

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
      difficulty: difficulty || "moderate",
      type,
      exercises,
      notes,
    };

    const activityId = createWorkoutActivity(activity);

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
    const body = await request.json();
    const { id, ...updates } = body;

    // Validate ID
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Update workout activity
    updateWorkoutActivity(id, updates);

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
    const body = await request.json();
    const { id, strava_activity_id, completion_notes } = body;

    // Validate ID
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Mark workout activity as completed
    markWorkoutActivityCompleted(id, strava_activity_id, completion_notes);

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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // Validate ID
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Delete workout activity
    deleteWorkoutActivity(parseInt(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workout activity:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete workout activity" },
      { status: 500 }
    );
  }
}
