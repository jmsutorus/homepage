import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/auth/server";
import {
  getGoalById,
  getChecklistByGoalId,
  createGoalChecklistItem,
  reorderGoalChecklist,
} from "@/lib/db/goals";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/goals/[id]/checklist
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
    const goal = getGoalById(goalId, userId);
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const checklist = getChecklistByGoalId(goalId);
    return NextResponse.json(checklist);
  } catch (error) {
    console.error("Error fetching checklist:", error);
    return NextResponse.json(
      { error: "Failed to fetch checklist" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/goals/[id]/checklist
 * Body: { text } or { reorder: number[] }
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
    const goal = getGoalById(goalId, userId);
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const body = await request.json();

    // Handle reorder
    if (body.reorder && Array.isArray(body.reorder)) {
      const success = reorderGoalChecklist(goalId, body.reorder);
      return NextResponse.json({ success });
    }

    // Handle create
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const item = createGoalChecklistItem(goalId, { text: text.trim() });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating checklist item:", error);
    return NextResponse.json(
      { error: "Failed to create checklist item" },
      { status: 500 }
    );
  }
}
