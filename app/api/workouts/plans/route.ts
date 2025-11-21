import { NextRequest, NextResponse } from "next/server";
import {
  createWorkoutPlan,
  getAllWorkoutPlans,
  updateWorkoutPlan,
  deleteWorkoutPlan,
} from "@/lib/db/workouts";
import { auth } from "@/auth";
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
 * GET /api/workouts/plans
 * Get all workout plans for the user
 */
export async function GET() {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plans = getAllWorkoutPlans(userId);

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Error getting workout plans:", error);
    return NextResponse.json({ error: "Failed to get workout plans" }, { status: 500 });
  }
}

/**
 * POST /api/workouts/plans
 * Create a new workout plan
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, exercises, duration, intensity, type } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    // Create workout plan
    const planId = createWorkoutPlan({
      user_id: userId,
      name,
      description: description || null,
      exercises: exercises ? JSON.stringify(exercises) : null,
      duration: duration || 0,
      intensity: intensity || "medium",
      type: type || "other",
    });

    return NextResponse.json({ success: true, id: planId });
  } catch (error) {
    console.error("Error creating workout plan:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create workout plan" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/workouts/plans
 * Update a workout plan
 */
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    // Validate ID
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Convert exercises to JSON string if provided
    if (updates.exercises) {
      updates.exercises = JSON.stringify(updates.exercises);
    }

    // Update workout plan
    updateWorkoutPlan(id, updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating workout plan:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update workout plan" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workouts/plans
 * Delete a workout plan
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // Validate ID
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Delete workout plan
    deleteWorkoutPlan(parseInt(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workout plan:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete workout plan" },
      { status: 500 }
    );
  }
}
