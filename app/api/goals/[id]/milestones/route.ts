import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/auth/server";
import {
  getGoalById,
  getMilestonesByGoalId,
  createMilestone,
} from "@/lib/db/goals";
import { scheduleMilestoneNotifications } from "@/lib/firebase/notifications";
import { cookies } from "next/headers";


interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/goals/[id]/milestones
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

    // Verify user owns the goal
    const goal = await getGoalById(goalId, userId);
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const milestones = await getMilestonesByGoalId(goalId);
    return NextResponse.json(milestones);

  } catch (error) {
    console.error("Error fetching milestones:", error);
    return NextResponse.json(
      { error: "Failed to fetch milestones" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/goals/[id]/milestones
 * Body: { title, description?, target_date? }
 */
export async function POST(request: NextRequest, context: RouteContext) {
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

    // Verify user owns the goal
    const goal = await getGoalById(goalId, userId);
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, target_date } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const milestone = await createMilestone(goalId, {
      title: title.trim(),
      description: description?.trim() || undefined,
      target_date: target_date || undefined,
    });

    try {
      if (milestone.target_date) {
        const cookieStore = await cookies();
        const timezoneOffset = cookieStore.get("timezone-offset")?.value || "+00:00";
        await scheduleMilestoneNotifications(milestone, goal.slug, userId, timezoneOffset);
      }
    } catch (e) {
      console.error("Failed to schedule notifications for new milestone:", e);
    }

    return NextResponse.json(milestone, { status: 201 });

  } catch (error) {
    console.error("Error creating milestone:", error);
    return NextResponse.json(
      { error: "Failed to create milestone" },
      { status: 500 }
    );
  }
}
