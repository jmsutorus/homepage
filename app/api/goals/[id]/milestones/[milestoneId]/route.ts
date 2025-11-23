import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/server";
import {
  getGoalById,
  getMilestoneById,
  updateMilestone,
  deleteMilestone,
} from "@/lib/db/goals";

interface RouteContext {
  params: Promise<{ id: string; milestoneId: string }>;
}

/**
 * PATCH /api/goals/[id]/milestones/[milestoneId]
 * Body: { title?, description?, target_date?, completed? }
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const userId = await getUserId();
    const { id, milestoneId } = await context.params;
    const goalId = parseInt(id, 10);
    const mId = parseInt(milestoneId, 10);

    if (isNaN(goalId) || isNaN(mId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Verify user owns the goal
    const goal = getGoalById(goalId, userId);
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    // Verify milestone exists and belongs to this goal
    const existingMilestone = getMilestoneById(mId);
    if (!existingMilestone || existingMilestone.goalId !== goalId) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    const body = await request.json();
    const updates: {
      title?: string;
      description?: string;
      target_date?: string | null;
      completed?: boolean;
    } = {};

    if (body.title !== undefined) {
      updates.title = body.title;
    }
    if (body.description !== undefined) {
      updates.description = body.description;
    }
    if (body.target_date !== undefined) {
      updates.target_date = body.target_date;
    }
    if (body.completed !== undefined) {
      updates.completed = body.completed;
    }

    const updatedMilestone = updateMilestone(mId, updates);
    return NextResponse.json(updatedMilestone);
  } catch (error) {
    console.error("Error updating milestone:", error);
    return NextResponse.json(
      { error: "Failed to update milestone" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/goals/[id]/milestones/[milestoneId]
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const userId = await getUserId();
    const { id, milestoneId } = await context.params;
    const goalId = parseInt(id, 10);
    const mId = parseInt(milestoneId, 10);

    if (isNaN(goalId) || isNaN(mId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Verify user owns the goal
    const goal = getGoalById(goalId, userId);
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const success = deleteMilestone(mId);

    if (!success) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting milestone:", error);
    return NextResponse.json(
      { error: "Failed to delete milestone" },
      { status: 500 }
    );
  }
}
