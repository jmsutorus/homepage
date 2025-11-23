import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/server";
import {
  getGoals,
  getGoalsWithProgress,
  createGoal,
  type GoalStatus,
  type GoalPriority,
} from "@/lib/db/goals";

/**
 * GET /api/goals
 * Query params:
 * - status: Filter by status (comma-separated for multiple)
 * - priority: Filter by priority
 * - includeArchived: Include archived/abandoned goals
 * - withProgress: Include progress calculation
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    const searchParams = request.nextUrl.searchParams;

    const statusParam = searchParams.get("status");
    const priority = searchParams.get("priority") as GoalPriority | null;
    const includeArchived = searchParams.get("includeArchived") === "true";
    const withProgress = searchParams.get("withProgress") === "true";

    const options: {
      status?: GoalStatus | GoalStatus[];
      priority?: GoalPriority;
      includeArchived?: boolean;
    } = {};

    if (statusParam) {
      const statuses = statusParam.split(",") as GoalStatus[];
      options.status = statuses.length === 1 ? statuses[0] : statuses;
    }

    if (priority) {
      options.priority = priority;
    }

    if (includeArchived) {
      options.includeArchived = true;
    }

    const goals = withProgress
      ? getGoalsWithProgress(userId, options)
      : getGoals(userId, options);

    return NextResponse.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/goals
 * Body: { title, description?, content?, status?, target_date?, tags?, priority? }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { title, description, content, status, target_date, tags, priority } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const goal = createGoal(userId, {
      title: title.trim(),
      description: description?.trim() || undefined,
      content: content || undefined,
      status: status as GoalStatus || undefined,
      target_date: target_date || undefined,
      tags: tags || undefined,
      priority: priority as GoalPriority || undefined,
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error("Error creating goal:", error);
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    );
  }
}
