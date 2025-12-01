import { NextResponse } from "next/server";
import { deleteWorkoutActivity } from "@/lib/db/workout-activities";
import { getUserId } from "@/lib/auth/server";

/**
 * DELETE /api/activities/[id]
 * Delete a specific workout activity by ID
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getUserId();
    const activityId = parseInt(id, 10);

    if (isNaN(activityId)) {
      return NextResponse.json(
        { error: "Invalid activity ID" },
        { status: 400 }
      );
    }

    await deleteWorkoutActivity(activityId, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workout activity:", error);
    return NextResponse.json(
      { error: "Failed to delete activity" },
      { status: 500 }
    );
  }
}
