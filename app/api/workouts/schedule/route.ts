import { NextRequest, NextResponse } from "next/server";
import { createCalendarEvent, createCalendarDateTime, calculateEndDateTime } from "@/lib/api/google-calendar";
import { createScheduledWorkout, getScheduledWorkouts } from "@/lib/db/workouts";
import { auth } from "@/lib/auth-better";
import { cookies } from "next/headers";

/**
 * POST /api/workouts/schedule
 * Schedule a new workout by creating a Google Calendar event
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const {
      workout_plan_id,
      scheduled_date,
      scheduled_time,
      duration = 60,
      reminder_minutes = 60,
      notes,
      workout_name,
      workout_description,
      timezone = "UTC",
    } = body;

    // Validate required fields
    if (!scheduled_date || !scheduled_time) {
      return NextResponse.json(
        { error: "scheduled_date and scheduled_time are required" },
        { status: 400 }
      );
    }

    // Create Calendar event
    const startDateTime = createCalendarDateTime(scheduled_date, scheduled_time, timezone);
    const endDateTime = calculateEndDateTime(startDateTime, duration);

    const eventId = await createCalendarEvent(userId, {
      summary: workout_name || "Workout",
      description: workout_description || notes || "",
      start: {
        dateTime: startDateTime,
        timeZone: timezone,
      },
      end: {
        dateTime: endDateTime,
        timeZone: timezone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          {
            method: "email",
            minutes: reminder_minutes,
          },
          {
            method: "popup",
            minutes: reminder_minutes,
          },
        ],
      },
      colorId: "9", // Blue color for fitness
    });

    // Store in database
    const scheduledWorkoutId = createScheduledWorkout({
      user_id: userId,
      workout_plan_id,
      calendar_event_id: eventId,
      scheduled_date,
      scheduled_time,
      duration,
      reminder_minutes,
      notes,
      strava_activity_id: null,
    });

    return NextResponse.json({
      success: true,
      id: scheduledWorkoutId,
      calendar_event_id: eventId,
    });
  } catch (error) {
    console.error("Error scheduling workout:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to schedule workout" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/workouts/schedule
 * Get scheduled workouts for the user
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    // Get scheduled workouts
    const workouts = getScheduledWorkouts(
      userId,
      startDate || undefined,
      endDate || undefined
    );

    return NextResponse.json({ workouts });
  } catch (error) {
    console.error("Error getting scheduled workouts:", error);
    return NextResponse.json(
      { error: "Failed to get scheduled workouts" },
      { status: 500 }
    );
  }
}
