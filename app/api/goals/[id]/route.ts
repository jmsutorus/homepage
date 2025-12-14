import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/auth/server";
import {
  getGoalById,
  getGoalWithDetails,
  updateGoal,
  deleteGoal,
  type GoalStatus,
  type GoalPriority,
} from "@/lib/db/goals";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/goals/[id]
 * Query params:
 * - withDetails: Include milestones, checklists, and progress
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { id } = await context.params;
    const goalId = parseInt(id, 10);

    if (isNaN(goalId)) {
      return NextResponse.json({ error: "Invalid goal ID" }, { status: 400 });
    }

    const withDetails = request.nextUrl.searchParams.get("withDetails") === "true";

    const goal = await getGoalById(goalId, userId);
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    if (withDetails) {
      const goalWithDetails = await getGoalWithDetails(goal.slug, userId);
      return NextResponse.json(goalWithDetails);
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Error fetching goal:", error);
    return NextResponse.json(
      { error: "Failed to fetch goal" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/goals/[id]
 * Body: { title?, description?, content?, status?, target_date?, completed_date?, tags?, priority? }
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { id } = await context.params;
    const goalId = parseInt(id, 10);

    if (isNaN(goalId)) {
      return NextResponse.json({ error: "Invalid goal ID" }, { status: 400 });
    }

    const existingGoal = await getGoalById(goalId, userId);
    if (!existingGoal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const body = await request.json();
    const updates: {
      title?: string;
      description?: string;
      content?: string;
      status?: GoalStatus;
      target_date?: string | null;
      completed_date?: string | null;
      tags?: string[];
      priority?: GoalPriority;
    } = {};

    if (body.title !== undefined) {
      updates.title = body.title;
    }
    if (body.description !== undefined) {
      updates.description = body.description;
    }
    if (body.content !== undefined) {
      updates.content = body.content;
    }
    if (body.status !== undefined) {
      updates.status = body.status as GoalStatus;
    }
    if (body.target_date !== undefined) {
      updates.target_date = body.target_date;
    }
    if (body.completed_date !== undefined) {
      updates.completed_date = body.completed_date;
    }
    if (body.tags !== undefined) {
      updates.tags = body.tags;
    }
    if (body.priority !== undefined) {
      updates.priority = body.priority as GoalPriority;
    }

    const updatedGoal = await updateGoal(goalId, userId, updates);
    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/goals/[id]
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { id } = await context.params;
    const goalId = parseInt(id, 10);

    if (isNaN(goalId)) {
      return NextResponse.json({ error: "Invalid goal ID" }, { status: 400 });
    }

    const success = await deleteGoal(goalId, userId);

    if (!success) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return NextResponse.json(
      { error: "Failed to delete goal" },
      { status: 500 }
    );
  }
}
